import { v2 as cloudinary } from 'cloudinary'
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})
export const uploadBuffer = (buf) =>
  new Promise((resolve, reject) =>
    cloudinary.uploader.upload_stream({ folder: 'gold-app' }, (e, r) => (e ? reject(e) : resolve(r.secure_url))).end(buf))
