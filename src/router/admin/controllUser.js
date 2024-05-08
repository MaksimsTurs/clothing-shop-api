import Loger from "../../util/loger/loger.js"
import isAuth from '../../util/isAuth.js'

export default async function controllUser(req) {
  try {
    const timer = new Loger.create.Timer()

    timer.start('Check is user authorizated')
    const checkRes = await isAuth(req.params.token, true)
    timer.stop('Complete')
    
    return (checkRes.code === 200) ? { isAdmin: true } : { isAdmin: false }
  } catch(error) {
    throw new Error(error.message)
  }
}