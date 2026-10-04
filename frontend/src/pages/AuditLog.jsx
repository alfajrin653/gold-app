import { useEffect, useState } from 'react'
import api from '../lib/api'
import { dt } from '../lib/format'
import { Page } from '../components/ui'

const tone = { SUBMITTED: 'bg-sky-50 text-sky-700', APPROVED: 'bg-emerald-50 text-emerald-700', REJECTED: 'bg-rose-50 text-rose-600', LOGIN: 'bg-slate-100 text-slate-500' }
const label = { SUBMITTED: 'Diajukan', APPROVED: 'Disetujui', REJECTED: 'Ditolak', LOGIN: 'Login' }

export default function AuditLog() {
  const [rows, setRows] = useState([])
  useEffect(() => { api.get('/dashboard/audit', { params: { limit: 100 } }).then((r) => setRows(r.data)) }, [])
  return (
    <Page>
      <h1 className="text-2xl font-extrabold text-slate-800">Audit Log</h1>
      <p className="mb-6 text-sm text-slate-400">Jejak waktu setiap aksi sistem: siapa, melakukan apa, dan kapan.</p>
      <div className="card overflow-hidden"><div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-slate-50/60"><tr>{['Waktu', 'Aksi', 'Pelaku', 'Transaksi', 'Detail'].map((h) => <th key={h} className="th">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-50">
              <td className="td text-slate-400">{dt(r.createdAt)}</td>
              <td className="td"><span className={`rounded-full px-3 py-1 text-xs font-semibold ${tone[r.action] || tone.LOGIN}`}>{label[r.action] || r.action}</span></td>
              <td className="td font-semibold">{r.userName}</td><td className="td">{r.transactionId ? `#${r.transactionId}` : '-'}</td>
              <td className="td max-w-[260px] truncate text-slate-400">{r.detail?.note || (r.detail?.grams ? `${r.detail.grams} g` : '')}</td>
            </tr>))}</tbody>
        </table>
        {rows.length === 0 && <p className="p-10 text-center text-sm text-slate-300">Belum ada aktivitas.</p>}
      </div></div>
    </Page>
  )
}
