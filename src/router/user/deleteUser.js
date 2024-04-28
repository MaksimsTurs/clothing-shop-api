import Loger from "../../util/loger/loger.js"

export default async function deleteUser(req) {
  const timer = new Loger.create.Timer()
  
  let user
  
  try {
    if(!req.params.token) return RESPONSE_403("You need authinticate!")
    
    timer.start('FIND_AND_DELETE')
    user = await UserModel.findOneAndDelete({ token: req.params.token })
    timer.stop('Complete deleting user account', 'FIND_AND_DELETE')

    return { isRemoved: user ? true : false }
  } catch(error) {
    throw new Error(error.message)
  }
}