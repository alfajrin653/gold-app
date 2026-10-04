import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ArrowLeft,
  Loader2,
  Send,
} from 'lucide-react'
import api, { errMsg } from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useToast } from '../components/Toast'
import { idr } from '../lib/format'
import {
  ImageUpload,
  Page,
} from '../components/ui'

const KARATS = [
  8,
  9,
  10,
  14,
  16,
  17,
  18,
  20,
  22,
  23,
  24,
]

export default function TransactionForm({
  type,
}) {
  const buy = type === 'BELI'
  const { user } = useAuth()
  const toast = useToast()
  const nav = useNavigate()

  const [f, setF] = useState({
    salesName: user.name,
    location: '',
    counterpartyName: '',
    description: '',
    grams: '',
    pricePerGram: '',
    karat: '24',
    accountNumber: '',
  })

  const [files, setFiles] = useState({})
  const [busy, setBusy] = useState(false)

  const set = (k) => (e) =>
    setF({
      ...f,
      [k]: e.target.value,
    })

  const photoFields = buy
    ? [['photoGold', 'Foto Emas']]
    : [
        [
          'photoSaleProof',
          'Foto Bukti Jual',
        ],
        [
          'photoTransferProof',
          'Foto Bukti Transfer',
        ],
      ]

  const total =
    (Number(f.grams) || 0) *
    (Number(f.pricePerGram) || 0)

  const submit = async (e) => {
    e.preventDefault()

    if (
      !(Number(f.grams) > 0) ||
      !(Number(f.pricePerGram) > 0)
    ) {
      return toast(
        'Gram dan harga per gram harus lebih dari 0',
        'error',
      )
    }

    if (f.description.length > 2000) {
      return toast(
        'Deskripsi maksimal 2000 karakter',
        'error',
      )
    }

    const missing = photoFields.find(
      ([k]) => !files[k],
    )

    if (missing) {
      return toast(
        `${missing[1]} wajib diunggah`,
        'error',
      )
    }

    const fd = new FormData()

    fd.append('type', type)

    Object.entries(f).forEach(([k, v]) => {
      if (k === 'accountNumber' && !buy) {
        return
      }

      fd.append(k, v)
    })

    photoFields.forEach(([k]) =>
      fd.append(k, files[k]),
    )

    setBusy(true)

    try {
      await api.post('/transactions', fd)

      toast(
        'Form terkirim, menunggu approval Management',
        'success',
      )

      nav('/sales')
    } catch (x) {
      toast(errMsg(x), 'error')
      setBusy(false)
    }
  }

  return (
    <Page>
      <button
        onClick={() => nav('/sales')}
        className="mb-4 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-400 hover:text-sky-600"
      >
        <ArrowLeft size={16} />
        Kembali
      </button>

      <form
        onSubmit={submit}
        className="card mx-auto max-w-3xl space-y-6 p-7"
      >
        <div>
          <h1 className="text-2xl font-extrabold text-slate-800">
            {buy
              ? 'Form Pembelian'
              : 'Form Penjualan'}
          </h1>

          <p className="text-sm text-slate-400">
            Status awal:{' '}
            <span className="font-semibold text-amber-600">
              Menunggu Approval
            </span>
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label">
              Nama Sales
            </label>

            <input
              className="input"
              required
              value={f.salesName}
              onChange={set('salesName')}
            />
          </div>

          <div>
            <label className="label">
              {buy
                ? 'Lokasi Beli'
                : 'Lokasi Jual'}
            </label>

            <input
              className="input"
              required
              value={f.location}
              onChange={set('location')}
              placeholder="Contoh: Jakarta Barat"
            />
          </div>

          <div>
            <label className="label">
              {buy
                ? 'Nama Penjual'
                : 'Nama Pembeli'}
            </label>

            <input
              className="input"
              required
              value={f.counterpartyName}
              onChange={set(
                'counterpartyName',
              )}
            />
          </div>

          {buy && (
            <div>
              <label className="label">
                No Rekening Penjual
              </label>

              <input
                className="input"
                required
                inputMode="numeric"
                value={f.accountNumber}
                onChange={set(
                  'accountNumber',
                )}
                placeholder="Contoh: BCA 1234567890"
              />
            </div>
          )}

          <div>
            <label className="label">
              {buy
                ? 'Berapa Gram (Beli)'
                : 'Berapa Gram (Jual)'}
            </label>

            <input
              className="input"
              type="number"
              step="0.001"
              min="0"
              required
              value={f.grams}
              onChange={set('grams')}
            />
          </div>

          <div>
            <label className="label">
              Harga per Gram (Rp)
            </label>

            <input
              className="input"
              type="number"
              min="0"
              required
              value={f.pricePerGram}
              onChange={set(
                'pricePerGram',
              )}
            />
          </div>

          <div>
            <label className="label">
              Kadar Karat
            </label>

            <select
              className="input"
              value={f.karat}
              onChange={set('karat')}
            >
              {KARATS.map((k) => (
                <option
                  key={k}
                  value={k}
                >
                  {k} Karat
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="label">
              Total Harga (otomatis)
            </label>

            <div className="input bg-emerald-50/50 font-bold text-emerald-700">
              {idr(total)}
            </div>
          </div>

          <div className="sm:col-span-2">
            <label className="label">
              Deskripsi / Catatan Transaksi
            </label>

            <textarea
              className="input min-h-[110px] resize-y"
              maxLength={2000}
              value={f.description}
              onChange={set('description')}
              placeholder={
                buy
                  ? 'Tambahkan keterangan mengenai transaksi pembelian emas...'
                  : 'Tambahkan keterangan mengenai transaksi penjualan emas...'
              }
            />

            <p className="mt-1 text-right text-xs text-slate-400">
              {f.description.length}/2000
            </p>
          </div>
        </div>

        <div
          className={`grid gap-4 ${
            photoFields.length > 1
              ? 'sm:grid-cols-2'
              : ''
          }`}
        >
          {photoFields.map(([k, l]) => (
            <ImageUpload
              key={k}
              label={l}
              file={files[k]}
              onChange={(file) =>
                setFiles({
                  ...files,
                  [k]: file,
                })
              }
            />
          ))}
        </div>

        <button
          disabled={busy}
          className={`w-full ${
            buy
              ? 'btn-primary'
              : 'btn-green'
          }`}
        >
          {busy ? (
            <Loader2
              size={16}
              className="animate-spin"
            />
          ) : (
            <Send size={16} />
          )}

          Kirim untuk Approval
        </button>
      </form>
    </Page>
  )
}