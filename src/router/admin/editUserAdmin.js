import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from '../../util/isUndefinedOrNull.js'

import UserModel from '../../model/userModel.js'

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import { cache } from '../../../index.js'

export default async function editUserAdmin(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { files } = req
    const { firstName, secondName, role, id } = req.body
    const userProjection = { __v: false, password: false, token: false }
  
    let user, avatar

    timer.start('Convert new user img')
    if(Array.isArray(files) && files.length > 0) avatar = await convertAndSave(files, 50)
    timer.stop('Complete converting and saving imgs')

    timer.start(`Update user by id ${id}`)
    user = await UserModel.findById(id, userProjection)
    timer.stop('Complete updating user')

    user.firstName = firstName
    user.secondName = secondName
    user.role = isUndefinedOrNull(role) ? user.role : role
    user.avatar = avatar ? avatar[0] : user.avatar

    timer.start('Remove some cache and update user')    
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.set(cache.keys.USER_ID + id)
    await user.save()
    timer.stop('Complete removing and updating user')

    return user._doc
  } catch(error) {
    throw new Error(error.message)
  }
}