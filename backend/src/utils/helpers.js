export const wrap = (fn) => (req, res, next) => fn(req, res, next).catch(next)
export const logAudit = (db, { action, user, transactionId = null, detail = null }) =>
  db.auditLog.create({ data: { action, userId: user.id, userName: user.name, transactionId, detail } })
