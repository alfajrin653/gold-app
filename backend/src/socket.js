import { Server } from 'socket.io'
import jwt from 'jsonwebtoken'
let io
export const initSocket = (httpServer) => {
  io = new Server(httpServer, { cors: { origin: process.env.CLIENT_URL, credentials: true } })
  io.use((socket, next) => {
    try { socket.user = jwt.verify(socket.handshake.auth?.token, process.env.JWT_SECRET); next() }
    catch { next(new Error('unauthorized')) }
  })
  io.on('connection', (socket) => {
    const { id, role } = socket.user
    socket.join(role === 'MANAGEMENT' ? 'management' : `user:${id}`)
  })
}
export const emitToManagement = (event, data) => io?.to('management').emit(event, data)
export const emitToUser = (userId, event, data) => io?.to(`user:${userId}`).emit(event, data)
