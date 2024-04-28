import Loger from "../../util/loger/loger.js"

import OrderModel from '../../model/orderModel.js'

export default async function changeOrderStatus(req) {
  const timer = new Loger.create.Timer()

  try {
    timer.start('UPDATE_ORDER_STATUS')
    await OrderModel.findByIdAndUpdate(req.body.id, { status: req.body.status })
    timer.stop('Complete updating status', 'UPDATE_ORDER_STATUS')

    return req.body
  } catch(error) {
    throw new Error(error.message)
  }
}