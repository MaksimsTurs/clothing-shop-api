import Loger from "../../util/loger/loger.js"

import createPaypalClient from "../../util/paypal.js"

import { cache } from '../../../index.js'

import paypalSDK from '@paypal/checkout-server-sdk'

export default async function createOrder(req) {
  try {
    const timer = new Loger.create.Timer()
    console.log(cache._storage)
    const { checkID } = req.params
    const { totalOrderPrice } = cache.get(checkID)
  
    let paypalRequest, paypalResponse, paypalClient
      
    timer.start('Create paypal client')
    paypalClient = createPaypalClient()
    timer.stop('Complete creating paypal client')

    timer.start('Create order request')
    paypalRequest = new paypalSDK.orders.OrdersCreateRequest()
    paypalRequest.requestBody({ intent: 'CAPTURE', purchase_units: [{ amount: { currency_code: 'EUR', value: totalOrderPrice, description: 'Purchase the products' } }]})
    timer.stop('Complete creating order request')

    timer.start('Execute the request')
    paypalResponse = await paypalClient.execute(paypalRequest)
    timer.stop('Complete executing paypal request')

    return { orderID: paypalResponse.result.id }
  } catch(error) {
    throw new Error(error.message)
  }
}