import Loger from "../../util/loger/loger.js"

import { USER_AVATAR_QUALITY } from "../../constants/num-constans.js"
import { RESPONSE_400 } from "../../constants/error-constans.js"

export default async function editUser(req, res) {
  const timer = new Loger.create.Timer()
  const { body, files } = req

  const { firstName, secondName, email, id } = body

  let user, response
  let avatars = []

  try {
    Loger.text('Validating request id...')
    if(!isValidObjectId(id)) return RESPONSE_400('Id is not valid!')

    timer.start('CONVERT_AND_SAVE_IMG')
    if(files.length > 0) avatars = await convertAndSave(files, USER_AVATAR_QUALITY)
    timer.stop('Complete converging and saving img', 'CONVERT_AND_SAVE_IMG')

    timer.start('GETTING_USER_BY_ID')
    user = await UserModel.findById(id)
    timer.stop('Complete finding user', 'GETTING_USER_BY_ID')

    Loger.text('Updating user')
    user.firstName = firstName || user.firstName
    user.secondName = secondName || user.secondName
    user.email = email || user.email
    user.avatar = avatars.length > 0 ? avatars[0] : user.avatar

    response = { name: `${user.firstName} ${user.secondName}`, email: user.email, avatar: user.avatar }

    Loger.text('Saving user data and update cache...')
    const { role, order } = cache.get(cache.keys.USER_ID + id)
    cache.set(cache.keys.USER_ID + id, {...response, role, order })
    await user.save()
    
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}