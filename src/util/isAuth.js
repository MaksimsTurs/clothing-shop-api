import jwt from 'jsonwebtoken'

import Loger from './loger/loger.js'
import isNullOrUndefined from './isUndefinedOrNull.js'

import { RESPONSE_403, RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'
import { RESPONSE_200 } from '../constants/succes-constans.js'

import UserModel from '../model/user.model.js'

const USER_ARE_NOT_AUTHORIZATED = "You are not Authorizated!"
const USER_NOT_FOUND = "User not found!"
const USER_HAVE_NO_PERMISSION = "You have no permission!"
const USER_AUTHORIZATE_SUCCES = "Successfuly authorizated!"

export default async function isAuth(secret, isAdmin) {
  try {
    let token, existedUser

    Loger.log('Check is token defined')
    if(isNullOrUndefined(secret)) return RESPONSE_403(USER_ARE_NOT_AUTHORIZATED)

    Loger.log('Verifying token')
    token = jwt.verify(secret, process.env.CREATE_TOKEN_SECRET)
    if(!token) return RESPONSE_403(USER_ARE_NOT_AUTHORIZATED)

    Loger.log(`Find user by id "${token._id}"`)
    existedUser = await UserModel.findById(token._id)

    if(!existedUser) return RESPONSE_404(USER_NOT_FOUND)
    
    if(isAdmin && existedUser.role !== 'ADMIN') return RESPONSE_403(USER_HAVE_NO_PERMISSION)

    return {...RESPONSE_200(USER_AUTHORIZATE_SUCCES), ...existedUser._doc }
  } catch(error) {
    Loger.error(error, import.meta.url)
    return RESPONSE_500()
  }
}