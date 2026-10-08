import 'dotenv/config'
import http from 'http'
import express from 'express'
import cors from 'cors'
import path from 'path'
import { fileURLToPath } from 'url'

import { initSocket } from './socket.js'
import authRoutes from './routes/auth.js'
import txRoutes from './routes/transactions.js'
import dashRoutes from './routes/dashboard.js'

const app = express()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

app.use(cors({
  origin: process.env.CLIENT_URL,
  credentials: true,
}))

app.use(express.json())

// ================================
// API
// ================================

app.get('/api/health', (_, res) => {
  res.json({ ok: true })
})

app.use('/api/auth', authRoutes)
app.use('/api/transactions', txRoutes)
app.use('/api/dashboard', dashRoutes)

// ================================
// FRONTEND REACT
// ================================

const frontendPath = path.resolve(
  __dirname,
  '../../frontend/dist'
)

app.use(express.static(frontendPath))

// React Router fallback
app.get('*', (req, res) => {
  res.sendFile(
    path.join(frontendPath, 'index.html')
  )
})

// ================================
// ERROR HANDLER
// ================================

app.use((err, _req, res, _next) => {
  console.error(err)

  res.status(err.status || 500).json({
    message: err.message || 'Terjadi kesalahan server',
  })
})

const server = http.createServer(app)

initSocket(server)

const PORT = process.env.PORT || 4000

server.listen(PORT, '0.0.0.0', () => {
  console.log(`API berjalan di port ${PORT}`)
})