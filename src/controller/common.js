import loger from "../util/loger.js"
import userControllU from '../util/userControllU.js'

import { v2 as cloudinary } from 'cloudinary'

const common = {
  editUserData: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { token, firstName, secondName, email } = req.body
    const { code, message, existedUser } = await userControllU(token)

    const newAvatar = req.files[0] || req.file

    if(code !== 200) return res.status(code).send({ code, message })
    
    let secureURL = ''

    try { 
      if(newAvatar) {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true,
        })
        
        secureURL = (await cloudinary.uploader.upload(newAvatar.path)).secure_url
      }
      
      existedUser.firstName = firstName || existedUser.firstName, 
      existedUser.secondName = secondName || existedUser.secondName, 
      existedUser.email = email || existedUser.email, 
      existedUser.avatar = secureURL || existedUser.avatar

      await existedUser.save()  
      return res.status(200).send({ avatar: secureURL })
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '20 - 37')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
    }

  }
}

export default common