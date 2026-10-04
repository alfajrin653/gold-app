export const idr = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(Number(n) || 0)
export const gram = (n) => `${Number(n || 0).toLocaleString('id-ID', { maximumFractionDigits: 3 })} g`
export const dt = (d) => (d ? new Date(d).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' }) : '-')
export const typeLabel = (t) => (t === 'BELI' ? 'Pembelian' : 'Penjualan')
export const statusLabel = { MENUNGGU: 'Menunggu', DISETUJUI: 'Disetujui', DITOLAK: 'Ditolak' }
