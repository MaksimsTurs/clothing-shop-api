import Loger from "../../util/loger/loger.js"

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'

import UserModel from '../../model/userModel.js'

import { USER_AVATAR_QUALITY } from "../../constants/num-constans.js"
import { RESPONSE_400, RESPONSE_409 } from "../../constants/error-constans.js"

export default async function registration(req) {
  const timer = new Loger.create.Timer()
  const { files, body } = req
  const { firstName, secondName, password, confirmPassword, email } = body

  let existedUser = []
  let salt = '', _id = '', avatar = ''
  let registratedUser, token, response

  try {
    timer.start('CHECK_INPUT_VALIDITY')
    if(!validationResult(req.body).isEmpty() || (password.trim() !== confirmPassword.trim())) {
      return RESPONSE_400('First-Second name or E-Mail is incorrect')
    }  
    timer.stop('Complete user input validity checking', 'CHECK_INPUT_VALIDITY')

    timer.start('FINDING_EXISTED_USER')
    existedUser =  await UserModel.findOne({ $or: [{ $and: [{ firstName }, { secondName }] }, { $or: [{ email }] }] })
    timer.stop('Complete finding existed user', 'FINDING_EXISTED_USER')

    if(existedUser) return RESPONSE_409("User alredy exist!")

    Loger.text('Generating password salt')
    salt = await bcrypt.genSalt()
    Loger.text('Generating ObjectId')
    _id = new mongoose.Types.ObjectId()
    Loger.text('Generating token')
    token = jwt.sign({ _id }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '2d' })
    timer.start('CONVERT_IMG')
    if(files.length > 0) avatar = await convertAndSave(files, USER_AVATAR_QUALITY)
    timer.stop('Complete converting and saving imgs', 'CONVERT_IMG')

    timer.start('CREATE_USER')
    registratedUser = await UserModel.create({ _id, firstName, secondName, email, token, password: await bcrypt.hash(password, salt), avatar: avatar[0] })
    timer.stop('Complete creating new user', 'CREATE_USER')

    response = { id: registratedUser._id, avatar: registratedUser.avatar, name: `${firstName} ${secondName}`, token }

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}