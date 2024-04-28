import { v2 as cloudinary } from "cloudinary"

import Loger from "../loger/loger.js"

export default async function removeImages(urls) {
  Loger.start('Start removing images...', 'Remove time')
  const names = urls.map(url => {
    const splited = url.split("/")
    return splited[splited.length - 1].replace(/.(jpg|png|webp)/, '').trim()
  })

  cloudinary.config({ cloud_name: process.env.CLOUDINARY_NAME,  api_key: process.env.CLOUDINARY_API_KEY,  api_secret: process.env.CLOUDINARY_API_SECRET, secure: true })
  await cloudinary.api.delete_resources(names)
  Loger.end('End removing images...', 'Remove time')
}
