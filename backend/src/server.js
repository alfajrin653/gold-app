import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import { initSocket } from './socket.js'
import authRoutes from './routes/auth.js'
import txRoutes from './routes/transactions.js'
import dashRoutes from './routes/dashboard.js'

const app = express()
app.use(cors({ origin: process.env.CLIENT_URL, credentials: true }))
app.use(express.json())
app.get('/api/health', (_, res) => res.json({ ok: true }))
app.use('/api/auth', authRoutes)
app.use('/api/transactions', txRoutes)
app.use('/api/dashboard', dashRoutes)
app.use((err, _req, res, _next) => {
  console.error(err)
  res.status(err.status || 500).json({ message: err.message || 'Terjadi kesalahan server' })
})

const server = http.createServer(app)
initSocket(server)
server.listen(process.env.PORT || 4000, () => console.log(`API berjalan di port ${process.env.PORT || 4000}`))
