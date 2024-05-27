import Loger from "../../util/loger/loger.js"

import UserModel from '../../model/user.model.js'

export default async function deleteUser(req) {  
  try {
    const timer = new Loger.create.Timer()
    
    let user

    Loger.log('User are not authorizated')
    if(!req.params.token) return RESPONSE_403('User are not authorizated')
    
    timer.start(`Find user and delete by token "${req.params.token}"`)
    user = await UserModel.findOneAndDelete({ token: req.params.token })
    timer.stop('Complete')

    return { isRemoved: user ? true : false }
  } catch(error) {
    throw new Error(error.message)
  }
}