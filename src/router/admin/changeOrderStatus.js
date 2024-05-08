import Loger from "../../util/loger/loger.js"

import OrderModel from '../../model/orderModel.js'

export default async function changeOrderStatus(req) {
  try {
    const timer = new Loger.create.Timer()

    timer.start('Update order status')
    await OrderModel.findByIdAndUpdate(req.body.id, { status: req.body.status })
    timer.stop('Complete')

    return req.body
  } catch(error) {
    throw new Error(error.message)
  }
}