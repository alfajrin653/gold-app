import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { ImagePlus, X } from 'lucide-react'
import gsap from 'gsap'
import { statusLabel } from '../lib/format'

export const Page = ({ children }) => (
  <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }}>{children}</motion.div>
)

const badge = { MENUNGGU: 'bg-amber-50 text-amber-700', DISETUJUI: 'bg-emerald-50 text-emerald-700', DITOLAK: 'bg-rose-50 text-rose-600' }
export const StatusBadge = ({ status }) => (
  <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${badge[status]}`}>{statusLabel[status]}</span>
)

export function CountUp({ value, decimals = 0, suffix = '' }) {
  const [v, setV] = useState(0)
  useEffect(() => {
    const o = { n: 0 }
    const t = gsap.to(o, { n: Number(value) || 0, duration: 1.1, ease: 'power2.out', onUpdate: () => setV(o.n) })
    return () => t.kill()
  }, [value])
  return <>{v.toLocaleString('id-ID', { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}{suffix}</>
}

export function StatCard({ icon: Icon, label, tone = 'sky', children }) {
  const tones = { sky: 'bg-sky-50 text-sky-600', green: 'bg-emerald-50 text-emerald-600', amber: 'bg-amber-50 text-amber-600', rose: 'bg-rose-50 text-rose-500' }
  return (
    <motion.div whileHover={{ y: -3 }} className="card flex items-center gap-4 p-5">
      <div className={`grid h-12 w-12 place-items-center rounded-2xl ${tones[tone]}`}><Icon size={22} /></div>
      <div><p className="text-xs font-semibold text-slate-400">{label}</p><p className="text-xl font-extrabold text-slate-800">{children}</p></div>
    </motion.div>
  )
}

export function ImageUpload({ label, file, onChange }) {
  const url = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  return (
    <div>
      <span className="label">{label}</span>
      {url ? (
        <div className="relative overflow-hidden rounded-2xl border border-slate-100">
          <img src={url} alt={label} className="h-44 w-full object-cover" />
          <button type="button" onClick={() => onChange(null)} className="absolute right-2 top-2 rounded-full bg-white/90 p-1.5 text-slate-500 shadow hover:text-rose-500"><X size={16} /></button>
        </div>
      ) : (
        <label className="flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-sky-100 bg-sky-50/40 text-sm text-slate-400 transition hover:border-sky-300 hover:bg-sky-50">
          <ImagePlus size={26} className="text-sky-400" /> Klik untuk unggah foto (maks 5 MB)
          <input type="file" accept="image/*" className="hidden" onChange={(e) => onChange(e.target.files[0] || null)} />
        </label>
      )}
    </div>
  )
}

export function Modal({ children, onClose, wide }) {
  return (
    <motion.div className="fixed inset-0 z-50 grid place-items-center bg-slate-200/60 p-4 backdrop-blur-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={onClose}>
      <motion.div data-lenis-prevent initial={{ opacity: 0, scale: 0.96, y: 16 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.96 }}
        className={`card max-h-[90vh] w-full overflow-y-auto p-6 ${wide ? 'max-w-3xl' : 'max-w-md'}`} onClick={(e) => e.stopPropagation()}>
        {children}
      </motion.div>
    </motion.div>
  )
}
