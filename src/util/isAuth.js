import jwt from 'jsonwebtoken'

import Loger from './loger/loger.js'
import isNullOrUndefined from './isUndefinedOrNull.js'

import { RESPONSE_403, RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'
import { RESPONSE_200 } from '../constants/succes-constans.js'

import UserModel from '../model/userModel.js'

const USER_ARE_NOT_AUTHORIZATED = "You are not Authorizated!"
const USER_NOT_FOUND = "User not found!"
const USER_HAVE_NO_PERMISSION = "You have no permission!"

export default async function isAuth(secret, isAdmin) {
  let token, existedUser

  try {
    Loger.text('Check is token not null, undefined or empty string...')
    if(isNullOrUndefined(secret)) return RESPONSE_403(USER_ARE_NOT_AUTHORIZATED)

    Loger.text('Decoding token...')
    token = jwt.verify(secret, process.env.CREATE_TOKEN_SECRET)
    if(!token) return RESPONSE_403(USER_ARE_NOT_AUTHORIZATED)

    Loger.text('Getting user by id...')
    existedUser = await UserModel.findById(token.id)

    if(!existedUser) return RESPONSE_404(USER_NOT_FOUND)
    
    if(isAdmin && existedUser.role !== 'admin') return RESPONSE_403(USER_HAVE_NO_PERMISSION)

    return RESPONSE_200("Successfuly authorizated!")
  } catch(error) {
    Loger.error(error.message, import.meta.url)
    return RESPONSE_500()
  }
}