import Loger from "../../util/loger/loger.js"

import Product from '../../model/product.model.js'
import Action from '../../model/action.model.js'
import Category from '../../model/category.model.js'
import User from '../../model/user.model.js'
import Order from '../../model/order.model.js'
import Settings from '../../model/settings.model.js'

import { cache } from "../../../index.js"

export default async function getHomePageData() {
  try {
    const timer = new Loger.create.Timer()
    
    const commonProjection = { __v: false, createdAt: false, updatedAt: false }
    const productProjection = { stock: false }
    const settingsProjection = { _id: false, key: false }
    
    let usersCount = 0, productsCount = 0, ordersCount = 0
    let settings, products = [], actions = [], categories = []

    Loger.log('Trying to get data from cache')
    let response = cache.get(cache.keys.HOME_DATA)
  
    if(response) {
      Loger.log('Cache HIT, send response to client')
      return response
    }

    Loger.log('Cache MISS, get data from database')
    timer.start(`Get website settings from database`)
    settings = await Settings.findOne({ key: 'default' }, {...commonProjection, ...settingsProjection })
    timer.stop('Complete')

    if(!settings.isAllProductsHidden) {
      timer.start('Get products from database their stock > 1')
      products = await Product.find(undefined, {...commonProjection, ...productProjection }, { populate: ['actionID'] })
      for(let index = 0; index < products.length; index++) {
        products[index]._doc.precent = products[index]?.actionID?.precent || 0
        delete products[index]._doc.actionID
      }
      timer.stop('Complete')
    }

    timer.start('Get categories there is not hidden, populate "productsID" and "actionID"')
    categories = await Category.find({ isHidden: false }, commonProjection, { populate: ['productsID', 'actionID'] })
    for(let cindex = 0; cindex < categories.length; cindex++) {
      const category = categories[cindex]
      const action = categories[cindex]?.actionID
      
      categories[cindex]._doc.precent = action?.precent || 0
      categories[cindex]._doc.products = category.productsID
      categories[cindex]._doc.location = 'category'

      delete categories[cindex]._doc.actionID
      delete categories[cindex]._doc.productsID
    }
    timer.stop('Complete')

    timer.start('Get actions there is not hidden, populate "productsID"')
    actions = await Action.find({ isHidden: false }, commonProjection, { populate: ['productsID'] })
    for(let aindex = 0; aindex < actions.length; aindex++) {
      actions[aindex]._doc.products = actions[aindex].productsID
      actions[aindex]._doc.location = 'action'
      delete actions[aindex]._doc.productsID
    }
    timer.stop('Complete')

    timer.start('Get orders, products and Users count')
    ordersCount = await Order.countDocuments()
    usersCount = await User.countDocuments()
    productsCount = await Product.countDocuments()
    timer.stop('Complete')

    Loger.log('Assign data to response')
    response = { ordersCount, usersCount, productsCount, products, actions, categories }

    Loger.log(`Save response into cache by key "${cache.keys.HOME_DATA}"`)
    cache.set(cache.keys.HOME_DATA, response)

    Loger.log('Return response')
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}