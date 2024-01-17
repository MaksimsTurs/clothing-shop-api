import { v2 as cloudinary } from "cloudinary"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import nodemailer from 'nodemailer'

import loger from "../util/loger.js"
import validateUserData from "../util/validateUserInput.js"

import UserModel from '../model/userModel.js'

const user = {
  registration: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { firstName, secondName, password, email } = req.body
    const userAvatar = req.file || req.files[0]

    let hashedPassword = ''
    let userToken = ''
    let secureURL = ''
    let existedUser = []
    let registratedUser = {}
    let salt = ''

    try {
      existedUser =  await UserModel.find({ $or: [{ $and: [{ firstName }, { secondName }] }, { $or: [{ email }] }] })
      if(existedUser.length !== 0) return res.status(409).send({ code: 409, message: process.env.SERVER_409_RESPONSE_MESSAGE })
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ code: 500, message: process.env.SERVER_500_RESPONSE_MESSAGE })
    }

    // const { 
    //   validateFirstName, 
    //   validateSecondName, 
    //   validatePassword, 
    //   validateConfirmPassword, 
    //   validateEmail 
    // } = validateUserData(req.body)

    // if(!validateFirstName()) {
    //   return res.status(400).send({ code: 400, message: process.env.SERVER_400_RESPONSE_MESSAGE  })
    // } else if(!validateSecondName()) {
    //   return res.status(400).send({ code: 400, message: process.env.SERVER_400_RESPONSE_MESSAGE  })
    // } else if(!validatePassword()) {
    //   return res.status(400).send({ code: 400, message: process.env.SERVER_400_RESPONSE_MESSAGE  })
    // } else if(!validateConfirmPassword()) {
    //   return res.status(400).send({ code: 400, message: process.env.SERVER_400_RESPONSE_MESSAGE  })
    // } else if(!validateEmail()) {
    //   return res.status(400).send({ code: 400, message: process.env.SERVER_400_RESPONSE_MESSAGE  })
    // }

    try {
      salt = await bcrypt.genSalt()
      hashedPassword = await bcrypt.hash(password, salt)
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
    }

    try {
      registratedUser = new UserModel({ firstName, secondName, email, password: hashedPassword })
      userToken = jwt.sign({ id: registratedUser._id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '1m' })
      registratedUser.token = userToken
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
    }
    
    if(userAvatar) {
      try {
        cloudinary.config({
          cloud_name: process.env.CLOUDINARY_NAME,
          api_key: process.env.CLOUDINARY_API_KEY,
          api_secret: process.env.CLOUDINARY_API_SECRET,
          secure: true,
        })

        secureURL = (await cloudinary.uploader.upload(userAvatar.path)).secure_url
        registratedUser.avatar = secureURL
      } catch(error) {
        loger.logCatchError(error, import.meta.url)
        return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
      }
    }

    await registratedUser.save()
    
    return res.status(200).send({ token: userToken, avatar: secureURL, _id: registratedUser._id })
  },
  login: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { firstName, password, email } = req.body

    let existedUser = {}
    let isLogged = false

    try {
      existedUser = await UserModel.findOne({ $and: [{ firstName }, { email }] })
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
    }

    if(!existedUser) return res.status(404).send({ message: 'User not exist!' })

    try {
      isLogged = await bcrypt.compare(password, existedUser.password)
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
    }    
    
    if(isLogged) {
      existedUser.token = jwt.sign({ id: existedUser._id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '1m' })
      
      await existedUser.save()

      return res.status(200).send({ token: existedUser.token, avatar: existedUser.avatar })
    }

    return res.status(400).send({ mesasge: 'Password is wrong!' })
  },
  getUserByToken: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { token } = req.params

    if(!token) return res.status(404).send({ errorMessage: process.env.SERVER_404_RESPONSE_MESSAGE })

    let userToken = {}
    let existedUser = {}

    try {
      userToken = jwt.decode(token)
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ errorMessage: process.env.SERVER_500_RESPONSE_MESSAGE })
    }

    if(!userToken) return res.status(404).send({ errorMessage: process.env.SERVER_404_RESPONSE_MESSAGE })

    try {
      existedUser = await UserModel.findById(userToken.id)
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
    }

    if(!existedUser) {
      return res.status(404).send({ errorMessage: process.env.SERVER_404_RESPONSE_MESSAGE })
    } else {
      return res.status(200).send({
        firstName: existedUser.firstName,
        secondName: existedUser.secondName,
        avatar: existedUser.avatar,
        email: existedUser.email
      })
    }

  }
}

export default user