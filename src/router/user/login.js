import Loger from "../../util/loger/loger.js"

import UserModel from '../../model/userModel.js'

import bcrypt from 'bcrypt'

import { RESPONSE_400, RESPONSE_404 } from "../../constants/error-constans.js"

export default async function login(req) {
  const timer = new Loger.create.Timer()
  const { firstName, password, email, secondName } = req.body

  let existedUser, response
  let isLogged = false
  
  try {
    timer.start('CHECK_INPUT_VALIDITY')
    if(!validationResult(req.body).isEmpty()) return RESPONSE_400("Your data is wrong!")
    timer.stop('Complete user input validity checking', 'CHECK_INPUT_VALIDITY')

    timer.start('GETTING_USER')
    existedUser = await UserModel.findOne({ $and: [{ firstName }, { secondName }, { email }] })
    timer.stop('Complete getting user by firstName, email and password', 'GETTING_USER')

    if(!existedUser) return RESPONSE_404('User not exist!')

    Loger.text('Check is user logged')
    isLogged = await bcrypt.compare(password, existedUser.password)

    if(isLogged) {
      timer.start('UPDATE_USER_TOKEN')
      const { _id, token, avatar, firstName, secondName } = await UserModel.findByIdAndUpdate(existedUser._id, { token: jwt.sign({ id: existedUser._id, role: existedUser.role }, process.env.CREATE_TOKEN_SECRET, { expiresIn: '2d' }) }, { new: true })
      timer.stop('Complete updating user token', 'UPDATE_USER_TOKEN')

      response = { id: _id, name: `${firstName} ${secondName}`, token, avatar }

      return response
    }

    return RESPONSE_404("User not exist!")
  } catch(error) {
    throw new Error(error.message)
  }    
}