import Loger from "../../util/loger/loger.js"

import { RESPONSE_404 } from "../../constants/error-constans.js"

import User from '../../model/user.model.js'
import Order from '../../model/order.model.js'

import { cache } from "../../../index.js"

export default async function getUserById(req) {
  try {
    const timer = new Loger.create.Timer()
    const commonProjection = { __v: false, createdAt: false, updatedAt: false }

    let response = cache.get(cache.keys.USER_ID + req.params.id), existedUser
    let order = []  

    if(response) {
      Loger.log('Cache HIT, send response to client')
      return response
    }

    Loger.log('Cache MISS, get data from database')
    timer.start(`Finding user by id "${req.params.id}"`)
    existedUser = await User.findOne({ _id: req.params.id }, commonProjection)
    timer.stop(`Complete`)

    if(!existedUser) {
      Loger.log('User not found')
      return RESPONSE_404("User not found!")
    }

    timer.start('Get user orders')
    order = await Order.find({ $and: [{ firstName: existedUser.firstName, secondName: existedUser.secondName }] }, commonProjection)
    timer.stop('Complete')

    Loger.log('Assign data to response')
    response = { 
      role: existedUser.role, 
      name: `${existedUser.firstName} ${existedUser.secondName}`,
      avatar: existedUser.avatar, 
      email: existedUser.email,
      order
    }

    Loger.log('Update cache')
    cache.set(cache.keys.USER_ID + req.params.id, response)

    Loger.log('Return response')
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}