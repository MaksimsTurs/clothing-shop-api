import { RESPONSE_500 } from "../constants/error-constans.js"
import loger from "../util/loger.js"
import userControllU from '../util/userControllU.js'

import { v2 as cloudinary } from 'cloudinary'

import UserModel from "../model/userModel.js"
import ProductModel from '../model/productModel.js'

const common = {
  editUserData: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { token, firstName, secondName, email } = req.body
    const { code, message, existedUser } = await userControllU(token)

    const newAvatar = req.files[0] || req.file

    if(code !== 200) return res.status(code).send({ code, message })
    
    let secureURL = '', newUserData = {}

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

      const response = {
        firstName: firstName || existedUser.firstName,
        secondName: secondName || existedUser.secondName,
        email: email || existedUser.email,
        avatar: secureURL || existedUser.avatar,
        token: existedUser.token
      }

      await UserModel.updateOne({ _id: existedUser._id  }, response)

      return res.status(200).send(response)
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '20 - 37')
			return res.status(500).send(RESPONSE_500())
    }

  },
  websiteStatistic: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    let usersLenght = 0, productsLenght = 0, brandsLenght = 0

    try {
      usersLenght = (await UserModel.find({})).length
      productsLenght = (await ProductModel.find({})).length

      loger.logResponseData({ usersLenght, productsLenght, brandsLenght })
      return res.status(200).send({ usersLenght, productsLenght, brandsLenght })
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send(RESPONSE_500())
    }   
  }
}

export default common