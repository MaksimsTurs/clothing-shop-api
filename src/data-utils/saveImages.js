import { v2 as cloudinary } from "cloudinary"

export default async function saveImages(images) {
  try {
    if(Array.isArray(images)) {
      let imagesURL = []
      for (let index = 0; index < images.length; index++) {
        cloudinary.config({ cloud_name: process.env.CLOUDINARY_NAME,  api_key: process.env.CLOUDINARY_API_KEY,  api_secret: process.env.CLOUDINARY_API_SECRET, secure: true })
        imagesURL.push((await cloudinary.uploader.upload(images[index].path)).secure_url)
        return imagesURL
      }
    }
    
    if(images) {
      cloudinary.config({ cloud_name: process.env.CLOUDINARY_NAME,  api_key: process.env.CLOUDINARY_API_KEY,  api_secret: process.env.CLOUDINARY_API_SECRET, secure: true })
      return (await cloudinary.uploader.upload(images.path)).secure_url
    }

    return null
  } catch(error) {
    throw new Error(error)
  }
}