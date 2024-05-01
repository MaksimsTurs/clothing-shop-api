import Loger from "../../util/loger/loger.js"

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import mongoose from "mongoose"
import { validationResult } from 'express-validator'

import UserModel from '../../model/userModel.js'

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
    if(!validationResult(req.body).isEmpty() || (password.trim() !== confirmPassword.trim())) return RESPONSE_400('Name or E-Mail is incorrect!')
    timer.stop('Check is successfuly completed')

    timer.start(`Check is user with { ${firstName} ${secondName} ${email} } exist`)
    existedUser =  await UserModel.findOne({ $or: [{ $and: [{ firstName }, { secondName }] }, { $or: [{ email }] }] })
    if(existedUser) return RESPONSE_409("User alredy exist!")
    timer.stop('Succesfuly checked, user not exist')


    Loger.text('Generating password salt')
    salt = await bcrypt.genSalt()

    Loger.text('Generating ObjectId')
    _id = new mongoose.Types.ObjectId()
    
    Loger.text('Generating token')
    token = jwt.sign({ _id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '2d' })
    
    timer.start(`Converting and saving user avatar, img quality ${USER_AVATAR_QUALITY}`)
    if(files.length > 0) avatar = await convertAndSave(files, USER_AVATAR_QUALITY)
    timer.stop('User avatar is successfuly converted and saved')

    timer.start('Creating and saving new user')
    registratedUser = await UserModel.create({ _id, firstName, secondName, email, token, password: await bcrypt.hash(password, salt), avatar: avatar[0] })
    timer.stop('New user are successfuly created and saved')

    return { id: registratedUser._id, avatar: registratedUser.avatar, name: `${firstName} ${secondName}`, token }
  } catch(error) {
    throw new Error(error.message)
  }
}