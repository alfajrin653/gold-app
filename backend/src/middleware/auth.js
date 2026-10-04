import jwt from 'jsonwebtoken'
export const auth = (req, res, next) => {
  try {
    req.user = jwt.verify((req.headers.authorization || '').replace('Bearer ', ''), process.env.JWT_SECRET)
    next()
  } catch { res.status(401).json({ message: 'Sesi tidak valid, silakan login ulang' }) }
}
export const requireRole = (...roles) => (req, res, next) =>
  roles.includes(req.user.role) ? next() : res.status(403).json({ message: 'Akses ditolak untuk role ini' })
