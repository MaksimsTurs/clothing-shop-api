import cloudinary from 'cloudinary'

const user = {
  registration: async (req, res) => {
    // const base64Image = Buffer.from(req.files[0].buffer).toString('base64')
    // const dataURI = `data:${req.files[0].mimetype};base64${base64Image}`

   console.log(req.files[0])

    try {
      const d = await cloudinary.v2.uploader.upload(req.files[0].path)
      console.log(d.secure_url)
    } catch(e) {
      // console.log(e)
    }
  }
}

export default user