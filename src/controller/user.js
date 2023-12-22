import cloudinary from 'cloudinary'

const user = {
  registration: async (req, res) => {
    console.log('[SERVER]: Registration')

    try {
      const d = await cloudinary.v2.uploader.upload(req.files[0].path)
      return res.status(200).send({ url: d.secure_url })
    } catch(e) {
      console.log(e)
    }
  }
}

export default user