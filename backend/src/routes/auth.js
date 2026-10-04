import { Router } from 'express'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { prisma } from '../config/db.js'
import { auth } from '../middleware/auth.js'
import { wrap, logAudit } from '../utils/helpers.js'
const r = Router()

r.post('/login', wrap(async (req, res) => {
  const { email, password } = req.body
  const user = await prisma.user.findUnique({ where: { email: String(email || '').toLowerCase() } })
  if (!user || !(await bcrypt.compare(String(password || ''), user.password)))
    return res.status(401).json({ message: 'Email atau password salah' })
  const payload = { id: user.id, name: user.name, role: user.role }
  await logAudit(prisma, { action: 'LOGIN', user: payload })
  res.json({ token: jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '12h' }), user: { ...payload, email: user.email } })
}))

r.get('/me', auth, (req, res) => res.json({ user: req.user }))
export default r
