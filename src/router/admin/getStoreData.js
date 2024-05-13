import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import UserModel from '../../model/userModel.js'
import OrderModel from '../../model/orderModel.js'
import WebsiteSettingsModel from '../../model/websiteSetting.js'

export default async function getStoreData() {
  try {
    const timer = new Loger.create.Timer()
  
    let products = [], productsSection = [], users = [], orders = []
    let websiteSettings, response = cache.get(cache.keys.ADMIN_STORE_DATA)
  
    const commonProjection = { __v: false }
    const userProjection = { password: false, token: false }
  
    if(response) {
      Loger.log('Cache HIT, send response to client')
      return response
    }

    Loger.log('Cache MISS, get data from database')
    timer.start('Get website settings')
    websiteSettings = (await WebsiteSettingsModel.find({}, {...commonProjection, createdAt: false, updatedAt: false, _id: false, key: false }))[0]
    timer.stop('Complete')

    timer.start('Get all products')
    products = await ProductModel.find({}, commonProjection)
    timer.stop('Complete')

    timer.start('Get all users')
    users = await UserModel.find({}, {...userProjection, ...commonProjection })
    timer.stop('Complete')

    timer.start('Get all sections')
    productsSection = await SectionModel.find({}, commonProjection, { populate: { path: 'productsID' } })
    timer.stop('Complete')

    timer.start('Get all orders ')
    orders = await OrderModel.find({}, commonProjection)
    timer.stop('Complete')

    timer.start('Pushing products in section')
    for(let index = 0; index < productsSection.length; index++) {
      productsSection[index] = {
        ...productsSection[index]._doc, 
        products: productsSection[index].productsID,
        productsID: productsSection[index].productsID.map(product => product._id)
      }
    }	
    timer.stop('Complete')

    Loger.log('Assign data to response')
    response = { products, productsSection, users, orders, websiteSettings }

    Loger.log('Save response in cache')
    // cache.set(cache.keys.ADMIN_STORE_DATA, response)

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}