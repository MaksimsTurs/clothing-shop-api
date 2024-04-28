import Loger from "../../util/loger/loger.js"

import createPaypalClient from "../../util/paypal.js"

export default async function createOrder(req) {
  const timer = new Loger.create.Timer()
  const { params } = req

  let paypalRequest, paypalResponse, paypalClient

  const { checkID } = params

  try {
    const { totalOrderPrice } = cache.get(checkID)
    
    timer.start('CREATE_PAYPAL_CLIENT')
    paypalClient = createPaypalClient()
    timer.stop('Complete creating paypal client', 'CREATE_PAYPAL_CLIENT')

    timer.start('CREATE_ORDER_REQUEST')
    paypalRequest = new paypalSDK.orders.OrdersCreateRequest()
    paypalRequest.requestBody({ intent: 'CAPTURE', purchase_units: [{ amount: { currency_code: 'EUR', value: totalOrderPrice, description: 'Purchase the products' } }]})
    timer.stop('Complete creating order request', 'CREATE_ORDER_REQUEST')

    timer.start('EXECUTE_REQUEST')
    paypalResponse = await paypalClient.execute(paypalRequest)
    timer.stop('Complete executing paypal request', 'EXECUTE_REQUEST')


    return { orderID: paypalResponse.result.id }
  } catch(error) {
    throw new Error(error.message)
  }
}