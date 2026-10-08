import { Router } from 'express'
import { prisma } from '../config/db.js'
import { auth, requireRole } from '../middleware/auth.js'
import { wrap } from '../utils/helpers.js'

const r = Router()

r.use(auth, requireRole('MANAGEMENT'))

r.get('/summary', wrap(async (_, res) => {
  const [stock, pending, daily, recent] = await Promise.all([
    prisma.stock.findUnique({
      where: { id: 1 },
    }),

    prisma.transaction.count({
      where: {
        status: 'MENUNGGU',
      },
    }),

    prisma.$queryRaw`
      SELECT
        DATE_FORMAT(reviewedAt, '%Y-%m-%d') AS day,
        CAST(type AS CHAR) AS type,
        CAST(SUM(grams) AS DOUBLE) AS grams
      FROM \`Transaction\`
      WHERE status = 'DISETUJUI'
        AND reviewedAt > NOW() - INTERVAL 14 DAY
      GROUP BY DATE(reviewedAt), type
      ORDER BY DATE(reviewedAt)
    `,

    prisma.transaction.findMany({
      where: {
        status: 'MENUNGGU',
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    }),
  ])

  res.json({
    totalStockGrams: Number(stock?.totalGrams || 0),
    pendingCount: pending,
    daily,
    pending: recent,
  })
}))

r.get('/audit', wrap(async (req, res) => {
  const take = Math.min(Number(req.query.limit) || 50, 200)

  res.json(
    await prisma.auditLog.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      take,
    }),
  )
}))

export default r