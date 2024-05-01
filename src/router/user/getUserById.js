import Loger from "../../util/loger/loger.js"

import { RESPONSE_404 } from "../../constants/error-constans.js"

import UserModel from '../../model/userModel.js'
import OrderModel from '../../model/orderModel.js'

import { cache } from "../../../index.js"

export default async function getUserById(req) {
  try {
    const timer = new Loger.create.Timer()
    const commonProjection = { __v: false, createdAt: false, updatedAt: false }

    let response = cache.get(cache.keys.USER_ID + req.params.id), existedUser
    let order = []  

    if(existedUser) {
      Loger.log('Cache HIT, send response to client')
      return response
    }

    Loger.log('Cache MISS, get data from database')
    timer.start(`Get user by id "${req.params.id}"`)
    existedUser = await UserModel.findOne({ _id: req.params.id }, commonProjection)
    timer.stop(`Complete getting user by id "${req.params.id}"`)

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

    cache.set(cache.keys.USER_ID + req.params.id, response)

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}