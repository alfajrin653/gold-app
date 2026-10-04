import { Router } from 'express'
import { prisma } from '../config/db.js'
import { auth, requireRole } from '../middleware/auth.js'
import { upload } from '../middleware/upload.js'
import { uploadBuffer } from '../config/cloudinary.js'
import { emitToManagement, emitToUser } from '../socket.js'
import { wrap, logAudit } from '../utils/helpers.js'

const r = Router()

r.use(auth)

// SALES: buat transaksi (BELI / JUAL)
r.post('/', requireRole('SALES'), upload, wrap(async (req, res) => {
  const b = req.body
  const f = req.files || {}
  const u = req.user

  const type = b.type

  if (!['BELI', 'JUAL'].includes(type)) {
    return res.status(400).json({ message: 'Tipe transaksi tidak valid' })
  }

  const grams = Number(b.grams)
  const pricePerGram = Number(b.pricePerGram)
  const karat = Number(b.karat)
  const description = String(b.description || '').trim()

  if (!(grams > 0)) {
    return res.status(400).json({ message: 'Gram harus lebih dari 0' })
  }

  if (!(pricePerGram > 0)) {
    return res.status(400).json({ message: 'Harga per gram harus lebih dari 0' })
  }

  if (!Number.isInteger(karat) || karat < 1 || karat > 24) {
    return res.status(400).json({ message: 'Karat harus 1-24' })
  }

  if (!b.location?.trim() || !b.counterpartyName?.trim()) {
    return res.status(400).json({
      message: 'Lokasi dan nama pihak lawan wajib diisi',
    })
  }

  if (description.length > 2000) {
    return res.status(400).json({
      message: 'Deskripsi maksimal 2000 karakter',
    })
  }

  if (type === 'BELI' && (!b.accountNumber?.trim() || !f.photoGold)) {
    return res.status(400).json({
      message: 'No rekening dan Foto Emas wajib diisi',
    })
  }

  if (
    type === 'JUAL' &&
    (!f.photoSaleProof || !f.photoTransferProof)
  ) {
    return res.status(400).json({
      message: 'Foto Bukti Jual dan Bukti Transfer wajib diisi',
    })
  }

  const up = async (k) =>
    f[k]?.[0] ? uploadBuffer(f[k][0].buffer) : null

  const [
    photoGold,
    photoSaleProof,
    photoTransferProof,
  ] = await Promise.all([
    up('photoGold'),
    up('photoSaleProof'),
    up('photoTransferProof'),
  ])

  const tx = await prisma.$transaction(async (db) => {
    const t = await db.transaction.create({
      data: {
        type,
        salesId: u.id,
        salesName: b.salesName?.trim() || u.name,
        location: b.location.trim(),
        counterpartyName: b.counterpartyName.trim(),
        description: description || null,
        grams,
        pricePerGram,
        karat,
        totalPrice:
          Math.round(grams * pricePerGram * 100) / 100,
        accountNumber:
          type === 'BELI'
            ? b.accountNumber.trim()
            : null,
        photoGold,
        photoSaleProof,
        photoTransferProof,
      },
    })

    await logAudit(db, {
      action: 'SUBMITTED',
      user: u,
      transactionId: t.id,
      detail: {
        type,
        grams,
      },
    })

    return t
  })

  emitToManagement('transaction:new', tx)

  res.status(201).json(tx)
}))

// SALES: riwayat milik sendiri
r.get('/mine', requireRole('SALES'), wrap(async (req, res) => {
  res.json(
    await prisma.transaction.findMany({
      where: {
        salesId: req.user.id,
      },
      orderBy: {
        createdAt: 'desc',
      },
    }),
  )
}))

// MANAGEMENT: tracking jual-beli + filter
r.get('/', requireRole('MANAGEMENT'), wrap(async (req, res) => {
  const {
    sales,
    location,
    from,
    to,
    status,
    type,
    page = 1,
    limit = 20,
  } = req.query

  const where = {}

  if (sales) {
    where.salesName = {
      contains: sales,
      mode: 'insensitive',
    }
  }

  if (location) {
    where.location = {
      contains: location,
      mode: 'insensitive',
    }
  }

  if (status) where.status = status
  if (type) where.type = type

  if (from || to) {
    where.createdAt = {
      ...(from && {
        gte: new Date(`${from}T00:00:00`),
      }),
      ...(to && {
        lte: new Date(`${to}T23:59:59.999`),
      }),
    }
  }

  const take = Math.min(Number(limit) || 20, 100)
  const skip =
    (Math.max(Number(page), 1) - 1) * take

  const [items, total] = await Promise.all([
    prisma.transaction.findMany({
      where,
      orderBy: {
        createdAt: 'desc',
      },
      take,
      skip,
    }),
    prisma.transaction.count({ where }),
  ])

  res.json({
    items,
    total,
    page: Number(page),
    pages: Math.ceil(total / take),
  })
}))

// Detail transaksi
r.get('/:id', wrap(async (req, res) => {
  const t = await prisma.transaction.findUnique({
    where: {
      id: Number(req.params.id),
    },
  })

  if (
    !t ||
    (
      req.user.role === 'SALES' &&
      t.salesId !== req.user.id
    )
  ) {
    return res.status(404).json({
      message: 'Transaksi tidak ditemukan',
    })
  }

  res.json(t)
}))

// MANAGEMENT: approve
r.patch(
  '/:id/approve',
  requireRole('MANAGEMENT'),
  upload,
  wrap(async (req, res) => {
    const id = Number(req.params.id)
    const u = req.user
    const f = req.files || {}

    const existing =
      await prisma.transaction.findUnique({
        where: { id },
      })

    if (!existing) {
      return res.status(404).json({
        message: 'Transaksi tidak ditemukan',
      })
    }

    if (existing.status !== 'MENUNGGU') {
      return res.status(409).json({
        message: 'Transaksi sudah diproses',
      })
    }

    let approvalTransferProof = null

    // Khusus transaksi BELI:
    // Management wajib mengunggah bukti transfer
    if (existing.type === 'BELI') {
      const transferFile =
        f.approvalTransferProof?.[0]

      if (!transferFile) {
        return res.status(400).json({
          message:
            'Foto bukti transfer wajib diunggah sebelum menyetujui pembelian',
        })
      }

      approvalTransferProof =
        await uploadBuffer(transferFile.buffer)
    }

    const result =
      await prisma.$transaction(async (db) => {
        const t =
          await db.transaction.findUnique({
            where: { id },
          })

        if (!t) {
          return {
            code: 404,
            message: 'Transaksi tidak ditemukan',
          }
        }

        const stock = await db.stock.upsert({
          where: { id: 1 },
          update: {},
          create: { id: 1 },
        })

        if (
          t.type === 'JUAL' &&
          Number(stock.totalGrams) <
            Number(t.grams)
        ) {
          return {
            code: 422,
            message: `Stok tidak cukup (${stock.totalGrams} g tersedia)`,
          }
        }

        const claimed =
          await db.transaction.updateMany({
            where: {
              id,
              status: 'MENUNGGU',
            },
            data: {
              status: 'DISETUJUI',
              reviewedById: u.id,
              reviewedByName: u.name,
              reviewedAt: new Date(),
              rejectNote: null,
              ...(t.type === 'BELI' && {
                approvalTransferProof,
              }),
            },
          })

        if (claimed.count === 0) {
          return {
            code: 409,
            message: 'Transaksi sudah diproses',
          }
        }

        await db.stock.update({
          where: { id: 1 },
          data: {
            totalGrams: {
              [t.type === 'BELI'
                ? 'increment'
                : 'decrement']: t.grams,
            },
          },
        })

        await logAudit(db, {
          action: 'APPROVED',
          user: u,
          transactionId: id,
          detail: {
            type: t.type,
            grams: t.grams,
            ...(t.type === 'BELI' && {
              transferProofAttached: true,
            }),
          },
        })

        return {
          code: 200,
          tx:
            await db.transaction.findUnique({
              where: { id },
            }),
        }
      })

    if (result.code !== 200) {
      return res
        .status(result.code)
        .json({ message: result.message })
    }

    emitToUser(
      result.tx.salesId,
      'transaction:reviewed',
      result.tx,
    )

    res.json(result.tx)
  }),
)

// MANAGEMENT: reject
r.patch(
  '/:id/reject',
  requireRole('MANAGEMENT'),
  wrap(async (req, res) => {
    const id = Number(req.params.id)
    const u = req.user
    const note = String(
      req.body.note || '',
    ).trim()

    if (!note) {
      return res.status(400).json({
        message:
          'Deskripsi alasan penolakan wajib diisi',
      })
    }

    if (note.length > 2000) {
      return res.status(400).json({
        message:
          'Deskripsi alasan penolakan maksimal 2000 karakter',
      })
    }

    const claimed =
      await prisma.transaction.updateMany({
        where: {
          id,
          status: 'MENUNGGU',
        },
        data: {
          status: 'DITOLAK',
          rejectNote: note,
          reviewedById: u.id,
          reviewedByName: u.name,
          reviewedAt: new Date(),
        },
      })

    if (claimed.count === 0) {
      return res.status(409).json({
        message:
          'Transaksi tidak ditemukan atau sudah diproses',
      })
    }

    const tx =
      await prisma.transaction.findUnique({
        where: { id },
      })

    await logAudit(prisma, {
      action: 'REJECTED',
      user: u,
      transactionId: id,
      detail: {
        note,
      },
    })

    emitToUser(
      tx.salesId,
      'transaction:reviewed',
      tx,
    )

    res.json(tx)
  }),
)

export default r