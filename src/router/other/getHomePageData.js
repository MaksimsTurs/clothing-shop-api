import Loger from "../../util/loger/loger.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import UserModel from '../../model/userModel.js'
import OrderModel from '../../model/orderModel.js'
import WebsiteSettingsModel from '../../model/websiteSetting.js'

import { cache } from "../../../index.js"

export default async function getHomePageData() {
  try {
    const timer = new Loger.create.Timer()

    let usersCount = 0, productsCount = 0, ordersCount = 0
    let settings, products, sections
    let response = cache.get(cache.keys.HOME_DATA)
  
    const commonProjection = { __v: false, createdAt: false, updatedAt: false }
    const productProjection = { category: false, sectionID: false }
    
    if(response) {
      Loger.log('Cache HIT, send response to client')
      return response
    }

    Loger.log('Cache MISS, get data from database')
    timer.start(`Get website settings`)
    settings = (await WebsiteSettingsModel.find())[0]
    timer.stop('Complete getting website settings')

    if(!settings.isAllProductsHidden) {
      timer.start('Get products from database')
      products = await ProductModel.find({ stock: { $gte: 1 } }, {...commonProjection, ...productProjection })
      timer.stop('Complete getting products')
    }
    
    timer.start('Get sections from database')
    sections = await SectionModel.find({ isHidden: false }, commonProjection, { populate: { path: 'productsID', match: { stock: { $gte: 1 } } } })
    timer.stop('Complete getting sections')
    
    timer.start('Get orders count')
    ordersCount = await OrderModel.countDocuments()
    timer.stop('Complete getting orders count')
    
    timer.start('Get users accounts count')
    usersCount = await UserModel.countDocuments()
    timer.stop('Complete getting users accounts count')

    timer.start('Get products count')
    productsCount = await ProductModel.countDocuments()
    timer.stop('Complete getting products count')

    Loger.log('Assign data to response')
    response = { 
      ordersCount,
      usersCount,
      productsCount,
      products,
      sections: sections.map(section => ({...section._doc, products: section.productsID }))
    }

    Loger.log('Save response into cache and return him')
    cache.set(cache.keys.HOME_DATA, response)

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}