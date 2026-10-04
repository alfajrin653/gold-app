import { useCallback, useEffect, useMemo, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { ArrowDownCircle, ArrowUpCircle, Bell, Scale } from 'lucide-react'
import api from '../lib/api'
import { useSocket } from '../context/SocketContext'
import { dt, gram, idr, typeLabel } from '../lib/format'
import { CountUp, Page, StatCard } from '../components/ui'
import ReviewModal from '../components/ReviewModal'

export default function ManagementDashboard() {
  const socket = useSocket()
  const [data, setData] = useState(null)
  const [fresh, setFresh] = useState(new Set())
  const [sel, setSel] = useState(null)
  const load = useCallback(() => api.get('/dashboard/summary').then((r) => setData(r.data)), [])
  useEffect(() => { load() }, [load])
  useEffect(() => {
    if (!socket) return
    const onNew = (t) => { setFresh((s) => new Set(s).add(t.id)); load() }
    socket.on('transaction:new', onNew)
    return () => socket.off('transaction:new', onNew)
  }, [socket, load])

  const chart = useMemo(() => {
    const m = {}
    ;(data?.daily || []).forEach((r) => { m[r.day] = { ...(m[r.day] || { day: r.day, BELI: 0, JUAL: 0 }), [r.type]: r.grams } })
    return Object.values(m)
  }, [data])
  const sum = (t) => chart.reduce((a, r) => a + r[t], 0)

  return (
    <Page>
      <h1 className="text-2xl font-extrabold text-slate-800">Dashboard Management</h1>
      <p className="mb-7 text-sm text-slate-400">Ringkasan stok emas dan pengajuan terbaru dari tim Sales.</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard icon={Scale} label="Total Stok Emas" tone="amber"><CountUp value={data?.totalStockGrams || 0} decimals={2} suffix=" g" /></StatCard>
        <StatCard icon={Bell} label="Menunggu Approval" tone="sky"><CountUp value={data?.pendingCount || 0} /></StatCard>
        <StatCard icon={ArrowDownCircle} label="Beli (14 hari)" tone="sky"><CountUp value={sum('BELI')} decimals={1} suffix=" g" /></StatCard>
        <StatCard icon={ArrowUpCircle} label="Jual (14 hari)" tone="green"><CountUp value={sum('JUAL')} decimals={1} suffix=" g" /></StatCard>
      </div>
      <div className="mt-6 grid gap-6 lg:grid-cols-5">
        <div className="card p-6 lg:col-span-3">
          <h2 className="mb-4 font-extrabold text-slate-800">Grafik Beli vs Jual (gram, disetujui)</h2>
          {chart.length === 0 ? <p className="py-16 text-center text-sm text-slate-300">Belum ada transaksi disetujui.</p> : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={chart} margin={{ left: -10 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eef2f7" />
                <XAxis dataKey="day" tickFormatter={(d) => d.slice(5)} tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                <Tooltip cursor={{ fill: '#f0f9ff' }} contentStyle={{ borderRadius: 16, border: '1px solid #f1f5f9' }} />
                <Legend />
                <Bar dataKey="BELI" name="Beli" fill="#7dd3fc" radius={[6, 6, 0, 0]} />
                <Bar dataKey="JUAL" name="Jual" fill="#6ee7b7" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>
        <div className="card flex flex-col p-6 lg:col-span-2">
          <h2 className="mb-4 flex items-center gap-2 font-extrabold text-slate-800"><Bell size={18} className="text-sky-500" /> Notifikasi Masuk</h2>
          <div data-lenis-prevent className="max-h-[300px] flex-1 space-y-2.5 overflow-y-auto pr-1">
            <AnimatePresence>
              {(data?.pending || []).map((t) => (
                <motion.button layout key={t.id} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0 }} onClick={() => { setSel(t); setFresh((s) => { const n = new Set(s); n.delete(t.id); return n }) }}
                  className="w-full rounded-2xl border border-slate-100 bg-white p-3.5 text-left transition hover:border-sky-200 hover:bg-sky-50/50">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-slate-700">{typeLabel(t.type)} &middot; {gram(t.grams)}</span>
                    {fresh.has(t.id) && <span className="animate-pulse rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-700">BARU</span>}
                  </div>
                  <p className="text-xs text-slate-400">{t.salesName} &middot; {t.location} &middot; {idr(t.totalPrice)}</p>
                  <p className="mt-0.5 text-[11px] text-slate-300">{dt(t.createdAt)}</p>
                </motion.button>
              ))}
            </AnimatePresence>
            {data && data.pending.length === 0 && <p className="py-10 text-center text-sm text-slate-300">Tidak ada pengajuan baru 🎉</p>}
          </div>
        </div>
      </div>
      <AnimatePresence>{sel && <ReviewModal tx={sel} canReview onClose={() => setSel(null)} onDone={() => { setSel(null); load() }} />}</AnimatePresence>
    </Page>
  )
}
