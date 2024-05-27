import Loger from "../../util/loger/loger.js"
import isDefined from "../../util/isDefined.js"

import User from '../../model/user.model.js'

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import { cache } from '../../../index.js'

export default async function updateUserAdmin(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { files } = req
    const { id } = req.body
  
    let user, avatar

    if(files.length > 0) {
      timer.start()
      avatar = await convertAndSave(files, 50)
      timer.stop(`Convert img to "WEBP", quality ${50}`)
    }

    timer.start()
    user = await User.findByIdAndUpdate(id, { avatar: avatar?.[0] ? avatar[0] : user.avatar, ...isDefined.assign(req.body).check() }, { projection: { password: false, token: false } })
    timer.stop(`Update user by id "${id}"`)

    timer.start(`Remove some cache and update user "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.USER_ID + id}"`)    
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.set(cache.keys.USER_ID + id)
    await user.save()
    timer.stop('Complete')

    return user._doc
  } catch(error) {
    throw new Error(error.message)
  }
}