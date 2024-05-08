import Loger from "../../util/loger/loger.js"

import { cache } from '../../../index.js'

import paypal from "../../util/paypal.js"

export default async function createOrder(req) {
  try {
    const timer = new Loger.create.Timer()

    const { checkID } = req.params
    const { totalOrderPrice } = cache.get(checkID)

    timer.start('Generating paypal access token')
    const { access_token } = await paypal.auth()
    timer.stop('Complete')  

    timer.start('Create paypal order')
    const order = await paypal.checkout(access_token, 'EUR', `${totalOrderPrice}`)
    timer.stop('Complete')

    return order
  } catch(error) {
    throw new Error(error.message)
  }
}