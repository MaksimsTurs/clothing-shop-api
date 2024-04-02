import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'

import convertAndSave from '../util/data-utils/convertAndSave.js'

import { RESPONSE_403, RESPONSE_404, RESPONSE_409, RESPONSE_500 } from '../constants/error-constans.js'

import UserModel from '../model/userModel.js'

import loger from "../util/loger.js"

const user = {
  registration: async (req, res) => {
    const { originalUrl, file, files, body, params } = req
    loger.request(originalUrl, body, params)

    const { firstName, secondName, password, email } = body

    let salt = '', _id = ''
    let existedUser = []
    let registratedUser = {}, token = {}

    try {
      existedUser =  await UserModel.findOne({ $or: [{ $and: [{ firstName }, { secondName }] }, { $or: [{ email }] }] })
      if(existedUser) return res.status(409).send(RESPONSE_409("User alredy exist!"))
    } catch(error) {
      loger.error(error, '/controller/user.js', 'Find existed user.')
      return res.status(500).send(RESPONSE_500())
    }

    try {
      salt = await bcrypt.genSalt()
      _id = new mongoose.Types.ObjectId()
      token = jwt.sign({ _id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '1min' })

      registratedUser = await UserModel.create({ 
        _id,
        firstName, 
        secondName, 
        email, 
        token,
        password: await bcrypt.hash(password, salt),
        avatar: await convertAndSave(file || files, 50)
      })

      const response = { avatar: registratedUser.avatar, _id: registratedUser._id, firstName, secondName, token }

      res.status(200).send(response)  
      loger.response(response)
    } catch(error) {
      loger.error(error, '/controller/user.js', 'Send response to the client.')
      return res.status(500).send(RESPONSE_500())
    }
  },
  login: async (req, res) => {
    const { originalUrl, body, params } = req
    loger.request(originalUrl, body, params)

    const { firstName, password, email } = body

    let existedUser = {}
    let isLogged = false

    try {
      existedUser = await UserModel.findOne({ $and: [{ firstName }, { email }] })
      if(!existedUser) return res.status(404).send(RESPONSE_404("User not exist!"))
    } catch(error) {
      loger.error(error, '/controller/user.js', 'Find existed user.')
      return res.status(500).send(RESPONSE_500())
    }

    try {
      isLogged = await bcrypt.compare(password, existedUser.password)
      if(isLogged) {
        await UserModel.findByIdAndUpdate(existedUser._id, { token: jwt.sign({ _id: existedUser._id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '1m' }) })
        const response = { token: existedUser.token, avatar: existedUser.avatar, firstName: existedUser.firstName, secondName: existedUser.secondName }

        res.status(200).send(response)
        return loger.response(response)
      }
      return res.status(400).send(RESPONSE_404("User not exist!"))
    } catch(error) {
      loger.error(error, '/controller/user.js', 'User log in.')
      return res.status(500).send(RESPONSE_500())
    }    
  },
  getUserByToken: async (req, res) => {
    const { originalUrl, body, params } = req
    loger.request(originalUrl, body, params)

    if(!params.token) return res.status(403).send(RESPONSE_403("You need to authonticate!"))

    let userToken = {}
    let existedUser = {}

    try {
      userToken = jwt.decode(params.token)
      if(!userToken) return res.status(403).send(RESPONSE_403())
    } catch(error) {
      loger.error(error, '/controller/user.js', 'Decode token.')
      return res.status(500).send(RESPONSE_500())
    }

    try {
      existedUser = await UserModel.findOne({ _id: userToken._id })
      if(!existedUser) return res.status(404).send(RESPONSE_404("User not founded!"))
      
      const response = { token: existedUser.token, role: existedUser.role, firstName: existedUser.firstName, secondName: existedUser.secondName, avatar: existedUser.avatar, email: existedUser.email }

      res.status(200).send(response)  
      loger.response(response)
    } catch(error) {
      loger.error(error, '/controller/user.js', 'Find user and send data to the client.')
      return res.status(500).send(RESPONSE_500())
    }
  },
  deleteUser: async (req, res) => {
    const { originalUrl, body, params } = req
    loger.request(originalUrl, body, params)


    if(!params.token) return res.status(403).send(RESPONSE_403())

    let isRemoved = false
    let user = undefined
    
    try {
      user = await UserModel.findOneAndDelete({ token: params.token })
      isRemoved = user ? true : false 

      res.status(200).send({ isRemoved })
      loger.response({ isRemoved })
    } catch(error) {
      loger.error(error, '/controller/user.js', 'Delete user.')
      return res.status(500).send(RESPONSE_500())
    }
  }
}

export default user