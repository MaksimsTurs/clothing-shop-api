import jwt from 'jsonwebtoken'

import loger from './loger.js'
import { RESPONSE_403, RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'

import UserModel from '../model/userModel.js'

/**
 * Function check the user token, if the user exist in Database and if user have access permission (optional). 
 * If token or user not exist or user have no access permission, retun 403 error code and message.
 * @param {string | null} secret is token, sended from Client.
 * @param {boolean | undefined} checkAdmin check have user Admin permission.
 */

export default async function userControllU(secret, checkAdmin) {
  let tokenData = {}, existedUser = {}, token = ''

  if(secret === 'undefined' || secret === 'null' || secret.length <= 0) return RESPONSE_403()
  
  token = secret

  try {
    tokenData = jwt.decode(token)
    if(!tokenData) return RESPONSE_403()
  } catch(error) {
    loger.logCatchError(error, import.meta.url, '23 - 24')
    return RESPONSE_500()
  }

  try {
    existedUser = await UserModel.findById(tokenData.id)
    if(!existedUser) {
      return RESPONSE_404()
    } else {
      if(checkAdmin && existedUser.role !== 'admin')  return RESPONSE_403()     
      return { code: 200, existedUser }
    }
  } catch(error) {
    loger.logCatchError(error, import.meta.url, '31 - 36')
    return RESPONSE_500()
  }
}