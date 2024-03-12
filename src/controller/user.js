import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import loger from "../util/loger.js"
import validateUserData from "../util/validateUserInput.js"

import findOne from '../data-utils/findOne.js'
import saveImages from '../data-utils/saveImages.js'

import { RESPONSE_400, RESPONSE_403, RESPONSE_404, RESPONSE_409, RESPONSE_500 } from '../constants/error-constans.js'

import UserModel from '../model/userModel.js'
import { pushInCache } from '../util/cache.js'

const user = {
  registration: async (req, res) => {
    const { protocol, hostname, originalUrl, file, files, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { firstName, secondName, password, email } = body
    const userAvatar = file || files[0]

    const { isConfirmPasswordValid, isEmailValid, isFirstNameValid, isPasswordValid, isSecondNameValied } = validateUserData(body)

    let salt = '', _id = undefined
    let existedUser = []
    let registratedUser = {}, token = {}

    try {
      existedUser =  await UserModel.find({ $or: [{ $and: [{ firstName }, { secondName }] }, { $or: [{ email }] }] })
      if(existedUser.length !== 0) return res.status(409).send(RESPONSE_409("User alredy exist!"))
    } catch(error) {
      loger.logError(error, import.meta.url, '30 - 31')
      return res.status(500).send(RESPONSE_500())
    }

    //------------------------ Validate User input ---------------------------//
    if(!isFirstNameValid())       return res.status(400).send(RESPONSE_400())
    if(!isSecondNameValied())     return res.status(400).send(RESPONSE_400())
    if(!isPasswordValid())        return res.status(400).send(RESPONSE_400())
    if(!isConfirmPasswordValid()) return res.status(400).send(RESPONSE_400())
    if(!isEmailValid())           return res.status(400).send(RESPONSE_400())
    //-----------------------------------------------------------------------//

    try {
      salt = await bcrypt.genSalt()
      _id = new mongoose.Types.ObjectId()
      token = jwt.sign({ _id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '1min' })

      registratedUser = new UserModel({ 
        _id,
        firstName, 
        secondName, 
        email, 
        token,
        password: await bcrypt.hash(password, salt),
        avatar: await saveImages(userAvatar)
      })

      await registratedUser.save()
      pushInCache(registratedUser, `user-${_id}`)

      loger.logResponse({ avatar: registratedUser.avatar, _id: registratedUser._id, firstName, secondName, token })
      return res.status(200).send({ avatar: registratedUser.avatar, _id: registratedUser._id, firstName, secondName, token })  
    } catch(error) {
      loger.logError(error, import.meta.url, '46 - 61')
      return res.status(500).send(RESPONSE_500())
    }
  },
  login: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { firstName, password, email } = req.body

    const { isEmailValid, isFirstNameValid, isPasswordValid } = validateUserData(body)

    let existedUser = {}
    let isLogged = false

    try {
      existedUser = await UserModel.findOne({ $and: [{ firstName }, { email }] })
      if(!existedUser) return res.status(404).send(RESPONSE_404("User not exist!"))
    } catch(error) {
      loger.logError(error, import.meta.url, '79 - 80')
      return res.status(500).send(RESPONSE_500())
    }

    //------------------------ Validate User input ---------------------------//
    if(!isFirstNameValid()) return res.status(400).send(RESPONSE_400())
    if(!isPasswordValid())  return res.status(400).send(RESPONSE_400())
    if(!isEmailValid())     return res.status(400).send(RESPONSE_400())
    //-----------------------------------------------------------------------//

    try {
      isLogged = await bcrypt.compare(password, existedUser.password)
      if(isLogged) {
        await UserModel.findByIdAndUpdate(existedUser._id, { token: jwt.sign({ id: existedUser._id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '1m' }) })
        
        loger.logResponse({ token: existedUser.token, avatar: existedUser.avatar, firstName: existedUser.firstName, secondName: existedUser.secondName })
        return res.status(200).send({ token: existedUser.token, avatar: existedUser.avatar, firstName: existedUser.firstName, secondName: existedUser.secondName })
      }

      return res.status(400).send(RESPONSE_404("User not exist!"))
    } catch(error) {
      loger.logError(error, import.meta.url, '93 - 100')
      return res.status(500).send(RESPONSE_500())
    }    
  },
  getUserByToken: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { token } = params

    if(!token) return res.status(403).send(RESPONSE_403())

    let userToken = {}
    let existedUser = {}

    try {
      userToken = jwt.decode(token)
      if(!userToken) return res.status(403).send(RESPONSE_403())
    } catch(error) {
      loger.logError(error, import.meta.url, '118 - 119')
      return res.status(500).send(RESPONSE_500())
    }

    try {
      existedUser = await findOne({ model: UserModel, cacheKey: `user-${token}`, condition: { _id: userToken._id } })
      if(!existedUser) return res.status(404).send(RESPONSE_404("User not founded!"))
      
      loger.logResponse({ token: existedUser.token, role: existedUser.role, firstName: existedUser.firstName, secondName: existedUser.secondName, avatar: existedUser.avatar, email: existedUser.email })
      return res.status(200).send({ token: existedUser.token, role: existedUser.role, firstName: existedUser.firstName, secondName: existedUser.secondName, avatar: existedUser.avatar, email: existedUser.email })  
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '126 - 129')
      return res.status(500).send(RESPONSE_500())
    }
  },
  removeUser: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { token } = params

    if(!token) return res.status(403).send(RESPONSE_403())

    let isRemoved = false
    let user = undefined

    try {
      user = await UserModel.findOneAndDelete({ token })
      isRemoved = user ? true : false 

      loger.logResponse({ isRemoved })
      return res.status(200).send({ isRemoved })
    } catch(error) {
      loger.logError(error, import.meta.url, '148 - 152')
      return res.status(500).send(RESPONSE_500())
    }
  }
}

export default user