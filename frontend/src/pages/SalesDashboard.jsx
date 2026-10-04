import { useCallback, useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { CheckCircle2, Clock, ShoppingBag, TrendingUp, XCircle } from 'lucide-react'
import api from '../lib/api'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { dt, gram, idr, typeLabel } from '../lib/format'
import { Page, StatCard, StatusBadge } from '../components/ui'
import ReviewModal from '../components/ReviewModal'

export default function SalesDashboard() {
  const { user } = useAuth()
  const socket = useSocket()
  const [items, setItems] = useState(null)
  const [sel, setSel] = useState(null)
  const load = useCallback(() => api.get('/transactions/mine').then((r) => setItems(r.data)), [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!socket) return
    socket.on('transaction:reviewed', load)
    return () => socket.off('transaction:reviewed', load)
  }, [socket, load])
  const count = (s) => (items || []).filter((i) => i.status === s).length
  return (
    <Page>
      <h1 className="text-2xl font-extrabold text-slate-800">Halo, {user.name} 👋</h1>
      <p className="mb-7 text-sm text-slate-400">Catat transaksi emas dan pantau status persetujuannya.</p>
      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/sales/beli"><motion.div whileHover={{ y: -4 }} className="card flex items-center gap-4 bg-gradient-to-br from-sky-50 to-white p-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-sky-100 text-sky-600"><ShoppingBag size={26} /></div>
          <div><p className="text-lg font-extrabold text-slate-800">Tambah Pembelian</p><p className="text-sm text-slate-400">Beli emas dari penjual</p></div></motion.div></Link>
        <Link to="/sales/jual"><motion.div whileHover={{ y: -4 }} className="card flex items-center gap-4 bg-gradient-to-br from-emerald-50 to-white p-6">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-emerald-100 text-emerald-600"><TrendingUp size={26} /></div>
          <div><p className="text-lg font-extrabold text-slate-800">Tambah Penjualan</p><p className="text-sm text-slate-400">Jual emas ke pembeli</p></div></motion.div></Link>
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-3">
        <StatCard icon={Clock} label="Menunggu" tone="amber">{count('MENUNGGU')}</StatCard>
        <StatCard icon={CheckCircle2} label="Disetujui" tone="green">{count('DISETUJUI')}</StatCard>
        <StatCard icon={XCircle} label="Ditolak" tone="rose">{count('DITOLAK')}</StatCard>
      </div>
      <div className="card mt-6 overflow-hidden">
        <div className="border-b border-slate-100 px-6 py-4"><h2 className="font-extrabold text-slate-800">Riwayat Form Saya</h2></div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50/60"><tr>{['Tanggal', 'Jenis', 'Gram', 'Total', 'Status', 'Catatan'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
            <tbody>
              <AnimatePresence>
                {(items || []).map((t, i) => (
                  <motion.tr key={t.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.03 }} onClick={() => setSel(t)} className="cursor-pointer border-t border-slate-50 hover:bg-sky-50/40">
                    <td className="td text-slate-400">{dt(t.createdAt)}</td><td className="td font-semibold">{typeLabel(t.type)}</td>
                    <td className="td">{gram(t.grams)}</td><td className="td">{idr(t.totalPrice)}</td>
                    <td className="td"><StatusBadge status={t.status} /></td>
                    <td className="td max-w-[220px] truncate text-rose-500">{t.rejectNote || ''}</td>
                  </motion.tr>
                ))}
              </AnimatePresence>
            </tbody>
          </table>
          {items && items.length === 0 && <p className="p-10 text-center text-sm text-slate-300">Belum ada transaksi. Mulai dengan tombol di atas.</p>}
        </div>
      </div>
      <AnimatePresence>{sel && <ReviewModal tx={sel} onClose={() => setSel(null)} />}</AnimatePresence>
    </Page>
  )
}
