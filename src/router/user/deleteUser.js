import Loger from "../../util/loger/loger.js"

export default async function deleteUser(req) {  
  try {
    const timer = new Loger.create.Timer()
    
    let user

    if(!req.params.token) return RESPONSE_403("You need authinticate!")
    
    timer.start(`Find user and delete by token ${req.params.token}`)
    user = await UserModel.findOneAndDelete({ token: req.params.token })
    timer.stop('Complete deleting user account')

    return { isRemoved: user ? true : false }
  } catch(error) {
    throw new Error(error.message)
  }
}