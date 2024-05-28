import Loger from "../../util/loger/loger.js"
import checker from "../../util/checker.js"

import User from '../../model/user.model.js'

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import { cache } from '../../../index.js'

import { RESPONSE_404 } from "../../constants/error-constans.js"

export default async function updateUserAdmin(req) {  
  try {
    const timer = new Loger.create.Timer()
    const projection = { password: false, token: false }
    const { files } = req
    const { id } = req.body
  
    let user, avatar
    
    if(files.length > 0) {
      timer.start()
      avatar = (await convertAndSave(files, 50))?.[0]
      timer.stop(`Convert img to "WEBP" format with quality ${50}`)
    }
    
    timer.start()
    user = await User.findById(id)
    timer.stop(`Find user with id: "${id}"`)
    
    if(!user) {
      Loger.error(`User with id "${id}" not found!`, import.meta.url)
      return RESPONSE_404(`User with id "${id}" not found!`)
    }

    timer.start()
    user = await User.findByIdAndUpdate(id, { avatar: avatar ? avatar : user.avatar, ...checker.isNotEmpty(req.body, ['id']) }, { projection, new: true })
    timer.stop(`Update user with id: "${id}"`)

    Loger.log(`Remove cache by key "${cache.keys.ADMIN_STORE_DATA}" and save updated user data`)    
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    await user.save()

    Loger.log('Return updated document')
    return user._doc
  } catch(error) {
    throw new Error(error.message)
  }
}