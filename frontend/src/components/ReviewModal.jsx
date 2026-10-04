import { useState } from 'react'
import {
  AnimatePresence,
  motion,
} from 'framer-motion'
import {
  Check,
  X,
} from 'lucide-react'
import api, { errMsg } from '../lib/api'
import {
  dt,
  gram,
  idr,
  typeLabel,
} from '../lib/format'
import {
  ImageUpload,
  Modal,
  StatusBadge,
} from './ui'
import { useToast } from './Toast'

const Row = ({ k, v }) => (
  <div>
    <p className="text-xs font-semibold text-slate-400">
      {k}
    </p>

    <p className="text-sm font-semibold text-slate-700">
      {v || '-'}
    </p>
  </div>
)

export default function ReviewModal({
  tx,
  canReview,
  onClose,
  onDone,
}) {
  const toast = useToast()

  const [zoom, setZoom] =
    useState(null)

  const [rejecting, setRejecting] =
    useState(false)

  const [note, setNote] =
    useState('')

  const [
    approvalTransferProof,
    setApprovalTransferProof,
  ] = useState(null)

  const [busy, setBusy] =
    useState(false)

  const buy = tx.type === 'BELI'

  const photos = [
    ['Foto Emas', tx.photoGold],
    [
      'Foto Bukti Jual',
      tx.photoSaleProof,
    ],
    [
      'Bukti Transfer Penjualan',
      tx.photoTransferProof,
    ],
    [
      'Bukti Transfer Management',
      tx.approvalTransferProof,
    ],
  ].filter((p) => p[1])

  const review = async (action) => {
    if (
      action === 'reject' &&
      !note.trim()
    ) {
      return toast(
        'Deskripsi alasan penolakan wajib diisi',
        'error',
      )
    }

    if (
      action === 'reject' &&
      note.trim().length > 2000
    ) {
      return toast(
        'Deskripsi alasan penolakan maksimal 2000 karakter',
        'error',
      )
    }

    if (
      action === 'approve' &&
      buy &&
      !approvalTransferProof
    ) {
      return toast(
        'Foto bukti transfer wajib diunggah sebelum menyetujui pembelian',
        'error',
      )
    }

    setBusy(true)

    try {
      let response

      if (
        action === 'approve' &&
        buy
      ) {
        const fd = new FormData()

        fd.append(
          'approvalTransferProof',
          approvalTransferProof,
        )

        response = await api.patch(
          `/transactions/${tx.id}/approve`,
          fd,
        )
      } else {
        response = await api.patch(
          `/transactions/${tx.id}/${action}`,
          action === 'reject'
            ? { note }
            : {},
        )
      }

      toast(
        action === 'approve'
          ? 'Transaksi disetujui, stok diperbarui'
          : 'Transaksi ditolak',
        'success',
      )

      onDone?.(response.data)
    } catch (e) {
      toast(errMsg(e), 'error')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <Modal
        wide
        onClose={onClose}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold text-sky-500">
              {typeLabel(tx.type)} #
              {tx.id}
            </p>

            <h3 className="text-xl font-extrabold text-slate-800">
              {gram(tx.grams)}
              {' · '}
              {tx.karat}K
            </h3>
          </div>

          <div className="flex items-center gap-3">
            <StatusBadge
              status={tx.status}
            />

            <button
              onClick={onClose}
              className="rounded-full p-1.5 text-slate-400 hover:bg-slate-100"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 rounded-2xl bg-sky-50/40 p-4 sm:grid-cols-3">
          <Row
            k="Nama Sales"
            v={tx.salesName}
          />

          <Row
            k="Lokasi"
            v={tx.location}
          />

          <Row
            k={
              buy
                ? 'Nama Penjual'
                : 'Nama Pembeli'
            }
            v={tx.counterpartyName}
          />

          <Row
            k="Harga / gram"
            v={idr(tx.pricePerGram)}
          />

          <Row
            k="Total harga"
            v={idr(tx.totalPrice)}
          />

          {buy && (
            <Row
              k="No Rekening Penjual"
              v={tx.accountNumber}
            />
          )}

          <Row
            k="Diajukan"
            v={dt(tx.createdAt)}
          />

          {tx.reviewedAt && (
            <Row
              k={`${
                tx.status === 'DITOLAK'
                  ? 'Ditolak'
                  : 'Disetujui'
              } oleh ${tx.reviewedByName}`}
              v={dt(tx.reviewedAt)}
            />
          )}
        </div>

        <div className="mt-4 rounded-2xl bg-slate-50 p-4">
          <p className="mb-1 text-xs font-semibold text-slate-400">
            Deskripsi Transaksi
          </p>

          <p className="whitespace-pre-wrap text-sm font-medium text-slate-700">
            {tx.description ||
              'Tidak ada deskripsi.'}
          </p>
        </div>

        {tx.status === 'DITOLAK' && (
          <div className="mt-4 rounded-2xl bg-rose-50 p-4 text-sm text-rose-600">
            <b>
              Deskripsi alasan penolakan:
            </b>{' '}
            {tx.rejectNote}
          </div>
        )}

        {photos.length > 0 && (
          <>
            <p className="label mt-5">
              Foto bukti (klik untuk
              memperbesar)
            </p>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {photos.map(([l, u]) => (
                <div key={l}>
                  <img
                    src={u}
                    alt={l}
                    onClick={() =>
                      setZoom(u)
                    }
                    className="h-44 w-full cursor-zoom-in rounded-2xl object-cover transition hover:opacity-90"
                  />

                  <p className="mt-1 text-xs text-slate-400">
                    {l}
                  </p>
                </div>
              ))}
            </div>
          </>
        )}

        {canReview &&
          tx.status ===
            'MENUNGGU' && (
            <div className="mt-6 border-t border-slate-100 pt-5">
              <AnimatePresence mode="wait">
                {rejecting ? (
                  <motion.div
                    key="r"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="space-y-3"
                  >
                    <div>
                      <label className="label">
                        Deskripsi Alasan
                        Penolakan (wajib)
                      </label>

                      <textarea
                        className="input min-h-[110px] resize-y"
                        maxLength={2000}
                        placeholder="Jelaskan alasan transaksi ini ditolak..."
                        value={note}
                        onChange={(e) =>
                          setNote(
                            e.target
                              .value,
                          )
                        }
                      />

                      <p className="mt-1 text-right text-xs text-slate-400">
                        {note.length}/2000
                      </p>
                    </div>

                    <div className="flex gap-3">
                      <button
                        disabled={busy}
                        onClick={() =>
                          review(
                            'reject',
                          )
                        }
                        className="btn-rose flex-1"
                      >
                        Kirim Penolakan
                      </button>

                      <button
                        disabled={busy}
                        onClick={() =>
                          setRejecting(
                            false,
                          )
                        }
                        className="btn-soft"
                      >
                        Batal
                      </button>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div
                    key="a"
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className="space-y-4"
                  >
                    {buy && (
                      <div className="rounded-2xl bg-emerald-50/40 p-4">
                        <ImageUpload
                          label="Foto Bukti Transfer ke Penjual (wajib)"
                          file={
                            approvalTransferProof
                          }
                          onChange={
                            setApprovalTransferProof
                          }
                        />

                        <p className="mt-2 text-xs text-slate-400">
                          Bukti transfer
                          wajib dilampirkan
                          sebelum transaksi
                          pembelian dapat
                          disetujui.
                        </p>
                      </div>
                    )}

                    <div className="flex gap-3">
                      <button
                        disabled={busy}
                        onClick={() =>
                          review(
                            'approve',
                          )
                        }
                        className="btn-green flex-1"
                      >
                        <Check
                          size={16}
                        />
                        Setujui
                      </button>

                      <button
                        disabled={busy}
                        onClick={() =>
                          setRejecting(
                            true,
                          )
                        }
                        className="btn-rose flex-1"
                      >
                        <X
                          size={16}
                        />
                        Tolak
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}
      </Modal>

      <AnimatePresence>
        {zoom && (
          <motion.div
            className="fixed inset-0 z-[70] grid cursor-zoom-out place-items-center bg-slate-100/90 p-6 backdrop-blur-md"
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: 1,
            }}
            exit={{
              opacity: 0,
            }}
            onClick={() =>
              setZoom(null)
            }
          >
            <img
              src={zoom}
              alt="preview"
              className="max-h-full max-w-full rounded-2xl shadow-2xl"
            />
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}