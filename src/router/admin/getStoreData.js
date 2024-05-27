import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import Product from '../../model/product.model.js'
import Action from '../../model/action.model.js'
import User from '../../model/user.model.js'
import Order from '../../model/order.model.js'
import Setting from '../../model/settings.model.js'
import Category from '../../model/category.model.js'

export default async function getStoreData() {
  try {
    const timer = new Loger.create.Timer()
  
    let products = [], productAction = [], users = [], orders = [], productCategory = []
    let websiteSettings, response = cache.get(cache.keys.ADMIN_STORE_DATA)

    if(response) {
      Loger.log('Cache HIT, send response to client')
      return response
    }

    Loger.log('Cache MISS, get data from database')
    timer.start()
    websiteSettings = await Setting.findOne({ key: 'default' })
    timer.stop('Get website settings')

    timer.start()
    products = await Product.find()
    timer.stop('Get all products')

    timer.start()
    users = await User.find()
    timer.stop('Get all users')

    timer.start()
    productAction = await Action.find()
    timer.stop('Get all actions')

    timer.start()
    orders = await Order.find()
    timer.stop('Get all orders')

    timer.start()
    productCategory = await Category.find()
    timer.stop('Get all categories')

    Loger.log('Assign data to response')
    response = { products, productAction, productCategory, users, orders, websiteSettings }

    Loger.log('Save response in cache')
    cache.set(cache.keys.ADMIN_STORE_DATA, response)

    Loger.log('Return response')
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}