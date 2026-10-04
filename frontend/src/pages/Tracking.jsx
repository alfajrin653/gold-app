import { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react'
import api from '../lib/api'
import { dt, gram, idr, typeLabel } from '../lib/format'
import { Page, StatusBadge } from '../components/ui'
import ReviewModal from '../components/ReviewModal'

const EMPTY = { sales: '', location: '', from: '', to: '', status: '' }

export default function Tracking() {
  const [f, setF] = useState(EMPTY)
  const [page, setPage] = useState(1)
  const [res, setRes] = useState({ items: [], total: 0, pages: 1 })
  const [loading, setLoading] = useState(true)
  const [sel, setSel] = useState(null)
  const [tick, setTick] = useState(0)
  const set = (k) => (e) => { setF({ ...f, [k]: e.target.value }); setPage(1) }

  useEffect(() => {
    setLoading(true)
    const h = setTimeout(() => {
      const params = Object.fromEntries(Object.entries({ ...f, page, limit: 10 }).filter(([, v]) => v !== ''))
      api.get('/transactions', { params }).then((r) => setRes(r.data)).finally(() => setLoading(false))
    }, 350)
    return () => clearTimeout(h)
  }, [f, page, tick])

  return (
    <Page>
      <h1 className="text-2xl font-extrabold text-slate-800">Tracking Jual-Beli</h1>
      <p className="mb-6 text-sm text-slate-400">Riwayat seluruh transaksi dengan filter.</p>
      <div className="card mb-5 grid gap-3 p-5 sm:grid-cols-2 lg:grid-cols-6">
        <div><label className="label">Nama Sales</label><input className="input" value={f.sales} onChange={set('sales')} placeholder="Cari sales" /></div>
        <div><label className="label">Lokasi</label><input className="input" value={f.location} onChange={set('location')} placeholder="Cari lokasi" /></div>
        <div><label className="label">Dari Tanggal</label><input type="date" className="input" value={f.from} onChange={set('from')} /></div>
        <div><label className="label">Sampai Tanggal</label><input type="date" className="input" value={f.to} onChange={set('to')} /></div>
        <div><label className="label">Status</label>
          <select className="input" value={f.status} onChange={set('status')}><option value="">Semua</option><option value="MENUNGGU">Menunggu</option><option value="DISETUJUI">Disetujui</option><option value="DITOLAK">Ditolak</option></select></div>
        <div className="flex items-end"><button onClick={() => { setF(EMPTY); setPage(1) }} className="btn-soft w-full"><RotateCcw size={15} /> Reset</button></div>
      </div>
      <div className="card overflow-hidden">
        <div className={`overflow-x-auto transition-opacity ${loading ? 'opacity-50' : ''}`}>
          <table className="w-full">
            <thead className="bg-slate-50/60"><tr>{['Tanggal', 'Jenis', 'Sales', 'Lokasi', 'Pihak', 'Gram', 'Total', 'Status'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              {res.items.map((t, i) => (
                <motion.tr key={t.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }} onClick={() => setSel(t)} className="cursor-pointer border-t border-slate-50 hover:bg-sky-50/40">
                  <td className="td text-slate-400">{dt(t.createdAt)}</td>
                  <td className="td"><span className={`font-semibold ${t.type === 'BELI' ? 'text-sky-600' : 'text-emerald-600'}`}>{typeLabel(t.type)}</span></td>
                  <td className="td">{t.salesName}</td><td className="td">{t.location}</td><td className="td">{t.counterpartyName}</td>
                  <td className="td">{gram(t.grams)}</td><td className="td">{idr(t.totalPrice)}</td><td className="td"><StatusBadge status={t.status} /></td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          {!loading && res.items.length === 0 && <p className="p-10 text-center text-sm text-slate-300">Tidak ada data yang cocok dengan filter.</p>}
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3 text-sm text-slate-400">
          <span>{res.total} transaksi</span>
          <div className="flex items-center gap-2">
            <button disabled={page <= 1} onClick={() => setPage(page - 1)} className="btn-soft !p-2"><ChevronLeft size={16} /></button>
            <span className="font-semibold text-slate-600">{page} / {res.pages || 1}</span>
            <button disabled={page >= res.pages} onClick={() => setPage(page + 1)} className="btn-soft !p-2"><ChevronRight size={16} /></button>
          </div>
        </div>
      </div>
      <AnimatePresence>{sel && <ReviewModal tx={sel} canReview onClose={() => setSel(null)} onDone={() => { setSel(null); setTick((n) => n + 1) }} />}</AnimatePresence>
    </Page>
  )
}
