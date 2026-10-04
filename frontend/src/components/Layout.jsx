import { useEffect } from 'react'
import { Navigate, NavLink, Outlet, useNavigate } from 'react-router-dom'
import { Coins, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useSocket } from '../context/SocketContext'
import { useToast } from './Toast'
import { gram, typeLabel } from '../lib/format'

const NAV = {
  SALES: [['/sales', 'Beranda']],
  MANAGEMENT: [['/management', 'Dashboard'], ['/management/tracking', 'Tracking Jual-Beli'], ['/management/audit', 'Audit Log']],
}

export default function Layout() {
  const { user, logout } = useAuth()
  const socket = useSocket()
  const toast = useToast()
  const nav = useNavigate()
  useEffect(() => {
    if (!socket) return
    const onNew = (t) => toast(`Pengajuan ${typeLabel(t.type).toLowerCase()} baru dari ${t.salesName} (${gram(t.grams)})`, 'info')
    const onRev = (t) => toast(t.status === 'DISETUJUI' ? `Transaksi #${t.id} disetujui` : `Transaksi #${t.id} ditolak: ${t.rejectNote}`, t.status === 'DISETUJUI' ? 'success' : 'error')
    socket.on('transaction:new', onNew); socket.on('transaction:reviewed', onRev)
    return () => { socket.off('transaction:new', onNew); socket.off('transaction:reviewed', onRev) }
  }, [socket, toast])
  if (!user) return <Navigate to="/login" replace />
  return (
    <div className="min-h-screen bg-gradient-to-br from-sky-50/70 via-white to-emerald-50/50">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-5 py-3">
          <div className="flex items-center gap-2.5 font-extrabold text-slate-800">
            <span className="grid h-9 w-9 place-items-center rounded-xl bg-amber-50 text-amber-500"><Coins size={20} /></span> Gold<span className="text-sky-500">Trade</span>
          </div>
          <nav className="flex gap-1 overflow-x-auto">
            {NAV[user.role].map(([to, l]) => (
              <NavLink key={to} to={to} end className={({ isActive }) => `whitespace-nowrap rounded-xl px-4 py-2 text-sm font-semibold transition ${isActive ? 'bg-sky-50 text-sky-700' : 'text-slate-400 hover:text-slate-700'}`}>{l}</NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden text-right sm:block"><p className="text-sm font-bold text-slate-700">{user.name}</p><p className="text-xs text-slate-400">{user.role === 'SALES' ? 'Sales' : 'Management'}</p></div>
            <button onClick={() => { logout(); nav('/login') }} className="rounded-xl bg-slate-50 p-2.5 text-slate-400 transition hover:bg-rose-50 hover:text-rose-500" title="Keluar"><LogOut size={18} /></button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-5 py-8"><Outlet /></main>
    </div>
  )
}
