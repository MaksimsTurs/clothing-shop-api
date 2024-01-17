import jwt from 'jsonwebtoken'

import loger from './loger.js'

import UserModel from '../model/userModel.js'

/**
 * @param {string | null} secret is token, sended from Client.
 * @param {boolean | undefined} checkAdmin check have user Admin permission.
 * @default Function check the user token and check if the user exist in Database.
 * @default if token or user not exist, retun 403 error code and message.
 */

export default async function userControllU(secret, checkAdmin) {
  let tokenData = {}, existedUser = {}, token = ''

  if(secret === 'undefined') {
    token = undefined
  } else if(secret === 'null') {
    token = null
  } else {
    token = secret
  }

  if(!token) return { code: 403, message: process.env.SERVER_403_RESPONSE_MESSAGE }

  try {
    tokenData = jwt.decode(token)
    if(!tokenData) return { code: 403, message: process.env.SERVER_403_RESPONSE_MESSAGE }
  } catch(error) {
    loger.logCatchError(error, import.meta.url, '28 - 29')
    return { code: 500, message: process.env.SERVER_500_RESPONSE_MESSAGE }
  }

  try {
    existedUser = await UserModel.findById(tokenData.id)
    if(!existedUser) {
      return { code: 403, message: process.env.SERVER_403_RESPONSE_MESSAGE }
    } else {
      if(checkAdmin) {
        if(existedUser.role !== 'admin')  return { code: 403, message: process.env.SERVER_403_RESPONSE_MESSAGE }
      }
      
      return { code: 200, existedUser }
    }
  } catch(error) {
    loger.logCatchError(error, import.meta.url, '36 - 45')
    return { code: 500, message: process.env.SERVER_500_RESPONSE_MESSAGE }
  }
}