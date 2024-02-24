import { v2 as cloudinary } from "cloudinary"
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import loger from "../util/loger.js"
import validateUserData from "../util/validateUserInput.js"
import { RESPONSE_400, RESPONSE_403, RESPONSE_404, RESPONSE_409, RESPONSE_500 } from '../constants/error-constans.js'

import UserModel from '../model/userModel.js'

const user = {
  registration: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { firstName, secondName, password, email } = req.body
    const userAvatar = req.file || req.files[0]

    let hashedPassword = '', userToken = '', secureURL = '', salt = ''
    let existedUser = []
    let registratedUser = {}

    try {
      existedUser =  await UserModel.find({ $or: [{ $and: [{ firstName }, { secondName }] }, { $or: [{ email }] }] })
      if(existedUser.length !== 0) return res.status(409).send(RESPONSE_409("User alredy exist!"))  //Check if user exist.
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '24 - 25')
      return res.status(500).send(RESPONSE_500())
    }

    const { 
      isConfirmPasswordValid,
      isEmailValid,
      isFirstNameValid,
      isPasswordValid,
      isSecondNameValied
    } = validateUserData(req.body)

    //------------------------ Validate User input ---------------------------//
    if(!isFirstNameValid()) return res.status(400).send(RESPONSE_400())
    if(!isSecondNameValied()) return res.status(400).send(RESPONSE_400())
    if(!isPasswordValid()) return res.status(400).send(RESPONSE_400())
    if(!isConfirmPasswordValid()) return res.status(400).send(RESPONSE_400())
    if(!isEmailValid()) return res.status(400).send(RESPONSE_400())
    //-----------------------------------------------------------------------//

    try {
      salt = await bcrypt.genSalt()
      hashedPassword = await bcrypt.hash(password, salt) //Generate hash
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send(RESPONSE_500())
    }

    try {
      registratedUser = new UserModel({ firstName, secondName, email, password: hashedPassword })
      userToken = jwt.sign({ id: registratedUser._id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '1m' })
      registratedUser.token = userToken
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '55 - 57')
      return res.status(500).send(RESPONSE_500())
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
        loger.logCatchError(error, import.meta.url, '65 - 73')
        return res.status(500).send(RESPONSE_500())
      }
    }

    await registratedUser.save()
    
    loger.logResponseData({ token: userToken, avatar: secureURL, _id: registratedUser._id, firstName, secondName })
    return res.status(200).send({ token: userToken, avatar: secureURL, _id: registratedUser._id, firstName, secondName })
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

      return res.status(200).send({ token: existedUser.token, avatar: existedUser.avatar, firstName: existedUser.firstName, secondName: existedUser.secondName })
    }

    return res.status(400).send({ mesasge: 'Password is wrong!' })
  },
  getUserByToken: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { token } = req.params

    if(!token) return res.status(404).send(RESPONSE_403())

    let userToken = {}
    let existedUser = {}

    try {
      userToken = jwt.decode(token)
      if(!userToken) return res.status(404).send(RESPONSE_403())
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send(RESPONSE_500())
    }

    try {
      existedUser = await UserModel.findById(userToken.id)
      if(!existedUser) return res.status(404).send(RESPONSE_404("User not founded!"))
      return res.status(200).send({ firstName: existedUser.firstName, secondName: existedUser.secondName, avatar: existedUser.avatar, email: existedUser.email })  
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send(RESPONSE_500())
    }
  },
  removeUser: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { token } = req.params

    if(!token) return res.status(404).send(RESPONSE_403())

    let isRemoved = false

    try {
      const user = await UserModel.findOneAndDelete({ token })
      isRemoved = user ? true : false 
      return res.status(200).send({ isRemoved })
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send(RESPONSE_500())
    }
  }
}

export default user