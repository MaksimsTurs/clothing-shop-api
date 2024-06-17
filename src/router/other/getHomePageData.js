import isNewUser from "../../util/isNewUser.js"
import isAuth from "../../util/isAuth.js"
import Loger from "../../util/loger/loger.js"
import getAuthHeader from "../../util/getAuthHeader.js"

import Product from '../../model/product.model.js'
import Action from '../../model/action.model.js'
import Category from '../../model/category.model.js'
import User from '../../model/user.model.js'
import Order from '../../model/order.model.js'
import Settings from '../../model/settings.model.js'

import { cache } from "../../../index.js"

export default async function getHomePageData(req) {
  try {
    const timer = new Loger.create.Timer()
        
    let usersCount = 0, productsCount = 0, ordersCount = 0
    let settings, products = [], actions = [], categories = []

    Loger.log('Trying to get data from cache')
    let response = cache.get(cache.keys.HOME_DATA)
  
    // if(response) {
    //   Loger.log('Cache HIT, send response to client')
    //   return response
    // }

    timer.start()
    const user = await isAuth(getAuthHeader(req))
    const isNew = isNewUser(user.createdAt)
    timer.start('Get user by token when authorizated')

    Loger.log('Cache MISS, get data from database')
    timer.start()
    settings = await Settings.findOne({ key: 'default' })
    timer.stop(`Get settings from database`)

    if(!settings.isAllProductsHidden) {
      timer.start()
      products = await Product.find(undefined, undefined, { populate: ['actionID'] })
      for(let index = 0; index < products.length; index++) {
        if(products[index]._doc?.actionID) products[index]._doc.precent = products[index]?.actionID?.precent || 0
        else if(isNew) products[index]._doc.precent = user.precent

        delete products[index]._doc.actionID
      }
      timer.stop('Get products from database and insert precent from action when exist')
    }

    timer.start()
    categories = await Category.find({ isHidden: false }, undefined, { populate: ['productsID', 'actionID'] })
    for(let cindex = 0; cindex < categories.length; cindex++) {
      const category = categories[cindex]
      const action = categories[cindex]?.actionID
      
      categories[cindex]._doc.precent = action?.precent || 0
      categories[cindex]._doc.products = category.productsID
      categories[cindex]._doc.location = 'category'

      delete categories[cindex]._doc.actionID
      delete categories[cindex]._doc.productsID
    }
    timer.stop('Get categories there is not hidden, populate "productsID" and "actionID"')

    timer.start()
    actions = await Action.find({ isHidden: false }, undefined, { populate: ['productsID'] })
    for(let aindex = 0; aindex < actions.length; aindex++) {
      actions[aindex]._doc.products = actions[aindex].productsID
      actions[aindex]._doc.location = 'action'

      delete actions[aindex]._doc.productsID
    }
    timer.stop('Get actions there is not hidden, populate "productsID"')

    timer.start()
    ordersCount = await Order.countDocuments()
    usersCount = await User.countDocuments()
    productsCount = await Product.countDocuments()
    timer.stop('Get orders, products and users count')

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