import Loger from "../../util/loger/loger.js"

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"
import { validationResult } from 'express-validator'

import User from '../../model/user.model.js'

import { USER_AVATAR_QUALITY } from "../../constants/num-constans.js"
import { RESPONSE_400, RESPONSE_409 } from "../../constants/error-constans.js"

export default async function registration(req) {
  try {
    const timer = new Loger.create.Timer()
    const { files, body } = req
    const { firstName, secondName, password, confirmPassword, email } = body
  
    let existedUser = []
    let salt = '', _id = ''
    let registratedUser, token, avatar

    timer.start('Check user input validity')
    if(!validationResult(req.body).isEmpty() || (password.trim() !== confirmPassword.trim())) return RESPONSE_400('Data is incorect!')
    timer.stop('Complete')

    timer.start(`Check is user with firstName "${firstName}" secondName "${secondName}" and email "${email}" exist`)
    existedUser = await User.findOne({ $or: [{ $and: [{ firstName }, { secondName }] }, { email }] })
    if(existedUser) return RESPONSE_409("User alredy exist!")
    timer.stop('Complete')


    Loger.log('Generating password salt')
    salt = await bcrypt.genSalt()

    Loger.log('Generating ObjectId')
    _id = new mongoose.Types.ObjectId()
    
    Loger.log('Generating token')
    token = jwt.sign({ _id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '2d' })
    
    if(files.length > 0) {
      timer.start(`Converting and saving user avatar, img quality ${USER_AVATAR_QUALITY}`)
      avatar = await convertAndSave(files, USER_AVATAR_QUALITY)
      timer.stop('Complete')
    }


    timer.start('Creating and saving new user')
    registratedUser = await User.create({ _id, firstName, secondName, email, token, password: await bcrypt.hash(password, salt), avatar: avatar?.[0] || null })
    timer.stop('Complete')

    Loger.log('Return user data')
    return { id: registratedUser._id, avatar: registratedUser.avatar, name: `${firstName} ${secondName}`, token }
  } catch(error) {
    throw new Error(error.message)
  }
}