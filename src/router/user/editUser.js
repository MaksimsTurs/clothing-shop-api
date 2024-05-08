import Loger from "../../util/loger/loger.js"

import convertAndSave from '../../util/data-utils/convertAndSave.js'

import { USER_AVATAR_QUALITY } from "../../constants/num-constans.js"
import { RESPONSE_400 } from "../../constants/error-constans.js"

import UserModel from '../../model/userModel.js'

import { cache } from '../../../index.js'

import { isValidObjectId } from 'mongoose'

export default async function editUser(req, res) {  
  try {
    const timer = new Loger.create.Timer()
    const { body, files } = req
  
    const { firstName, secondName, email, id } = body
  
    let user, response
    let avatars = []

    Loger.log(`Check id "${id}" validity`)
    if(!isValidObjectId(id)) return RESPONSE_400('Id is not valid!')

    timer.start(`Conver and save user img, quality ${USER_AVATAR_QUALITY}`)
    if(files.length > 0) avatars = await convertAndSave(files, USER_AVATAR_QUALITY)
    timer.stop('Complete')

    timer.start(`Find user by id "${id}"`)
    user = await UserModel.findById(id)
    timer.stop('Complete')

    Loger.log('Updating user data')
    user.firstName = firstName || user.firstName
    user.secondName = secondName || user.secondName
    user.email = email || user.email
    user.avatar = avatars.length > 0 ? avatars[0] : user.avatar

    Loger.log('Assign data to response')
    response = { name: `${user.firstName} ${user.secondName}`, email: user.email, avatar: user.avatar }

    timer.start('Saving user data and update cache')
    const { role, order } = cache.get(cache.keys.USER_ID + id)
    cache.set(cache.keys.USER_ID + id, {...response, role, order })
    await user.save()
    timer.stop('Cache')
    
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}