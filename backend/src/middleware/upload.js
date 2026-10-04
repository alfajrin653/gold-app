import multer from 'multer'

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_, f, cb) =>
    f.mimetype.startsWith('image/')
      ? cb(null, true)
      : cb(new Error('File harus berupa gambar')),
}).fields([
  { name: 'photoGold', maxCount: 1 },
  { name: 'photoSaleProof', maxCount: 1 },
  { name: 'photoTransferProof', maxCount: 1 },
  { name: 'approvalTransferProof', maxCount: 1 },
])