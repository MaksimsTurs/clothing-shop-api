import Loger from "../../util/loger/loger.js"
import isAuth from '../../util/isAuth.js'

export default async function controllUser(req) {
  const timer = new Loger.create.Timer()

  try {
    timer.start('IS_AUTH')
    const checkRes = await isAuth(req.params.token, true)
    timer.stop('Complete checking authorization', 'IS_AUTH')
    
    return checkRes
  } catch(error) {
    throw new Error(error.message)
  }
}