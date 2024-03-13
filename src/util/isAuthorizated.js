import jwt from 'jsonwebtoken'

import loger from './loger.js'
import isNullOrUndefined from './isUndefinedOrNull.js'

import { RESPONSE_403, RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'

import UserModel from '../model/userModel.js'

import findOne from '../data-utils/findOne.js'

export default async function isAuthorizated(secret, checkAdmin) {
  let token = {}, existedUser = {}

  if(isNullOrUndefined(secret)) return RESPONSE_403("You are not Authentificated!")
  
  try {
    token = jwt.decode(secret)
    if(!token) return RESPONSE_403()
  } catch(error) {
    loger.logError(error, import.meta.url, '18 - 19')
    return RESPONSE_500()
  }


  try {
    existedUser = await UserModel.findById(token._id)
    if(existedUser) {
      if(checkAdmin && existedUser.role !== 'admin') return RESPONSE_403("You have no permission!")
      return { code: 200, existedUser }
    } 

    return RESPONSE_404("User not finded!")
  } catch(error) {
    loger.logError(error, import.meta.url, '26 - 32')
    return RESPONSE_500()
  }
}