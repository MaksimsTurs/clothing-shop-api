import cloudinary from 'cloudinary'
import cloudinaryConf from '../config/cloudinarySetup.js'

const user = {
  registration: async (req, res) => {
    console.log('[SERVER]: Registration')

    try {
      cloudinaryConf().api_key
      const d = await cloudinary.v2.uploader.upload(req.files[0].path)
      return res.status(200).send({ url: d.secure_url })
    } catch(e) {
      console.log(e)
    }

    return res.status(200).send({ message: 'nope' })
  }
}

export default user