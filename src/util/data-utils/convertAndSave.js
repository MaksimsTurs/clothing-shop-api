import sharp from 'sharp'
import { v2 as cloudinary } from 'cloudinary'
import streamifier from 'streamifier'

export default async function convertAndSave(imgs, quality) {
  if(Array.isArray(imgs)) return await saveMultiple(imgs, quality)
  return await saveSingle(imgs, quality)
}

async function saveSingle(img, quality) {
  let buffer = await generateBuffer(img.buffer, quality)
  return await getSecureURL(buffer)
}

async function saveMultiple(imgs, quality) {
  let buffer = undefined
  let URLs = []
  let URL = ''
  
  for(let index = 0; index < imgs.length; index++) {
    buffer = await generateBuffer(imgs[index].buffer, quality)
    URL = await getSecureURL(buffer)
    URLs.unshift(URL)
  }

  return URLs
}

async function generateBuffer(IMGBuffer, quality) {
  return (await sharp(IMGBuffer).webp({ quality }).toBuffer())
}

function getSecureURL(buffer) {
  let uploadedStream = undefined

  return new Promise((resolve, reject) => {
    cloudinary.config({ cloud_name: process.env.CLOUDINARY_NAME,  api_key: process.env.CLOUDINARY_API_KEY,  api_secret: process.env.CLOUDINARY_API_SECRET, secure: true })
    uploadedStream = cloudinary.uploader.upload_stream(undefined, (error, result) => {
      if(error) reject(error)
      resolve(result.secure_url)
    })
    streamifier.createReadStream(buffer).pipe(uploadedStream)
  })
}