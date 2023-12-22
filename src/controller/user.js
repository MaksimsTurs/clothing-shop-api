import cloudinary from 'cloudinary'
import { config } from 'dotenv'

config()

const user = {
  registration: async (req, res) => {
    console.log('[SERVER]: Registration')

    try {
      cloudinary.v2.config({
        cloud_name: process.env.CLOUDINARY_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET,
        secure: true,
      });
      
      const d = await cloudinary.v2.uploader.upload(req.files[0].path)
      return res.status(200).send({ url: d.secure_url })
    } catch(e) {
      console.log(e)
    }

    return res.status(200).send({ message: 'nope' })
  }
}

export default user