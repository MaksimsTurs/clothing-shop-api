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
    console.log(response)
    if(response) {
      Loger.log('Cache HIT, send response to client')
      return response
    }

    Loger.log('Cache MISS, get data from database')
    timer.start(`Get website settings from database`)
    settings = (await WebsiteSettingsModel.find())[0]
    timer.stop('Complete')

    if(!settings.isAllProductsHidden) {
      timer.start('Get products from database their stock greater then "1"')
      products = await ProductModel.find({ stock: { $gte: 1 } }, {...commonProjection, ...productProjection })
      timer.stop('Complete')
    }
    
    timer.start('Get sections from database there is not hidden, populate "productsID" with stock greater then "1"')
    sections = await SectionModel.find({ isHidden: false }, commonProjection, { populate: { path: 'productsID', match: { stock: { $gte: 1 } } } })
    timer.stop('Complete')
    
    timer.start('Get orders count')
    ordersCount = await OrderModel.countDocuments()
    timer.stop('Complete')
    
    timer.start('Get users accounts count')
    usersCount = await UserModel.countDocuments()
    timer.stop('Complete')

    timer.start('Get products count')
    productsCount = await ProductModel.countDocuments()
    timer.stop('Complete')

    Loger.log('Assign data to response')
    response = { 
      ordersCount,
      usersCount,
      productsCount,
      products,
      sections: sections.map(section => ({...section._doc, products: section.productsID }))
    }

    Loger.log('Save response into cache')
    // cache.set(cache.keys.HOME_DATA, response)

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}