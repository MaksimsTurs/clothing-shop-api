import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

export default async function changeWebsiteSetting(req) {
  try {
    Loger.log('Update website settings')
    globalThis.settings = {...req.body, maxProductsPerPage: parseInt(req.body.maxProductsPerPage), deliveryFee: parseFloat(req.body.deliveryFee) }
    
    Loger.log('Restore cache')
    cache.restore()

    return {...globalThis.settings }
  } catch(error) {
    throw new Error(error.message)
  }
}