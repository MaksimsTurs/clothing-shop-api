import Loger from "../../util/loger/loger.js"

import { USER_AVATAR_QUALITY } from "../../constants/num-constans.js"
import { RESPONSE_400 } from "../../constants/error-constans.js"

export default async function editUser(req, res) {  
  try {
    const timer = new Loger.create.Timer()
    const { body, files } = req
  
    const { firstName, secondName, email, id } = body
  
    let user, response
    let avatars = []

    if(!isValidObjectId(id)) return RESPONSE_400('Id is not valid!')

    timer.start('Conver and save user img')
    if(files.length > 0) avatars = await convertAndSave(files, USER_AVATAR_QUALITY)
    timer.stop('Complete converging and saving img')

    timer.start(`Find user by id ${id}`)
    user = await UserModel.findById(id)
    timer.stop('Complete finding user')

    Loger.text('Updating user data')
    user.firstName = firstName || user.firstName
    user.secondName = secondName || user.secondName
    user.email = email || user.email
    user.avatar = avatars.length > 0 ? avatars[0] : user.avatar

    response = { name: `${user.firstName} ${user.secondName}`, email: user.email, avatar: user.avatar }

    timer.start('Saving user data and update cache...')
    const { role, order } = cache.get(cache.keys.USER_ID + id)
    cache.set(cache.keys.USER_ID + id, {...response, role, order })
    await user.save()
    timer.stop('User new data was successfuly saved')
    
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}