import Loger from "../../util/loger/loger.js"

import { RESPONSE_404 } from "../../constants/error-constans.js"

import UserModel from '../../model/userModel.js'
import OrderModel from '../../model/orderModel.js'

import { cache } from "../../../index.js"

export default async function getUserById(req) {
  const timer = new Loger.create.Timer()
  let response = cache.get(cache.keys.USER_ID + req.params.id), existedUser
  let order = []

  const commonProjection = { __v: false, createdAt: false, updatedAt: false }

  try {
    if(existedUser) {
      Loger.text('Cache HIT, send response to client')
      return response
    }

    Loger.text('Cache MISS, get data from database')
    timer.start('GETTING_USER')
    existedUser = await UserModel.findOne({ _id: req.params.id }, commonProjection)
    timer.stop('Complete getting user', 'GETTING_USER')

    if(!existedUser) return RESPONSE_404("User not found!")

    timer.start('GETTING_USER_ORDER')
    order = await OrderModel.find({ userID: existedUser._id }, commonProjection)
    timer.stop('Complete getting user orders', 'GETTING_USER_ORDER')

    response = { 
      role: existedUser.role, 
      name: `${existedUser.firstName} ${existedUser.secondName}`,
      avatar: existedUser.avatar, 
      email: existedUser.email,
      order
    }

    Loger.text('Caching response')
    cache.set(cache.keys.USER_ID + req.params.id, response)

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}