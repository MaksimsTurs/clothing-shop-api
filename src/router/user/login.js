import Loger from "../../util/loger/loger.js"

import User from '../../model/user.model.js'

import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { validationResult } from 'express-validator'

import { RESPONSE_400, RESPONSE_404 } from "../../constants/error-constans.js"

export default async function login(req) {
  const timer = new Loger.create.Timer()
  const { firstName, password, email, secondName } = req.body

  let existedUser, response
  let isThisUser = false

  try {
    timer.start()
    if(!validationResult(req.body).isEmpty()) return RESPONSE_400("Your data is wrong!")
    timer.stop('Check user input validity')

    timer.start(`Find user by firstName: "${firstName}" secondName: "${secondName}" and email: "${email}"`)
    existedUser = await User.findOne({ $and: [{ firstName }, { secondName }, { email }] })
    timer.stop('Complete')

    if(!existedUser) return RESPONSE_404('User not exist!')

    Loger.log('Check is user logged')
    isThisUser = await bcrypt.compare(password, existedUser.password)

    if(isThisUser) {
      timer.start()
      const { _id, token, avatar, firstName, secondName } = await User.findByIdAndUpdate(existedUser._id, { token: jwt.sign({ id: existedUser._id, role: existedUser.role }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '2d' }) }, { new: true })
      timer.stop('Update user data')

      Loger.log('Assign data to response')
      response = { id: _id, name: `${firstName} ${secondName}`, token, avatar }

      Loger.log('Return user')
      return response
    }

    Loger.log('User not exist')
    return RESPONSE_404("User not exist!")
  } catch(error) {
    throw new Error(error.message)
  }    
}