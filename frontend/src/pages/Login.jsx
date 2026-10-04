import { useState } from 'react'
import { motion } from 'framer-motion'
import { Coins, Loader2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { errMsg } from '../lib/api'

export default function Login() {
  const { login } = useAuth()
  const [f, setF] = useState({ email: '', password: '' })
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState(false)
  const submit = async (e) => {
    e.preventDefault(); setErr(''); setBusy(true)
    try { await login(f.email, f.password) } catch (x) { setErr(errMsg(x)); setBusy(false) }
  }
  return (
    <div className="relative grid min-h-screen place-items-center overflow-hidden bg-white p-5">
      <div className="absolute -left-24 -top-24 h-96 w-96 rounded-full bg-sky-100/70 blur-3xl" />
      <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-emerald-100/70 blur-3xl" />
      <div className="absolute right-1/3 top-10 h-60 w-60 rounded-full bg-amber-100/60 blur-3xl" />
      <motion.form onSubmit={submit} initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="card relative w-full max-w-sm space-y-5 p-8">
        <div className="text-center">
          <div className="mx-auto mb-3 grid h-14 w-14 place-items-center rounded-2xl bg-amber-50 text-amber-500"><Coins size={28} /></div>
          <h1 className="text-2xl font-extrabold text-slate-800">Gold<span className="text-sky-500">Trade</span></h1>
          <p className="mt-1 text-sm text-slate-400">Masuk untuk mengelola transaksi emas</p>
        </div>
        <div><label className="label">Email</label><input className="input" type="email" required value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} placeholder="nama@perusahaan.com" /></div>
        <div><label className="label">Password</label><input className="input" type="password" required value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} placeholder="••••••••" /></div>
        {err && <p className="rounded-xl bg-rose-50 px-4 py-2.5 text-sm text-rose-600">{err}</p>}
        <button disabled={busy} className="btn-primary w-full">{busy && <Loader2 size={16} className="animate-spin" />} Masuk</button>
        <p className="text-center text-xs text-slate-300">Demo: sales@demo.com / manager@demo.com &middot; password123</p>
      </motion.form>
    </div>
  )
}
