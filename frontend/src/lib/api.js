import axios from 'axios'
export const API = import.meta.env.VITE_API_URL || 'http://localhost:4000'
const api = axios.create({ baseURL: `${API}/api` })
api.interceptors.request.use((c) => {
  const t = localStorage.getItem('token')
  if (t) c.headers.Authorization = `Bearer ${t}`
  return c
})
api.interceptors.response.use((r) => r, (e) => {
  if (e.response?.status === 401 && !e.config.url.includes('/auth/login')) { localStorage.clear(); window.location.href = '/login' }
  return Promise.reject(e)
})
export const errMsg = (e) => e.response?.data?.message || e.message || 'Terjadi kesalahan'
export default api
