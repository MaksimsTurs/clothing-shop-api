import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import { readFile } from "fs/promises"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import UserModel from '../../model/userModel.js'
import OrderModel from '../../model/orderModel.js'
import path from "path"

export default async function getStoreData() {
  const timer = new Loger.create.Timer()

  let products = [], productsSection = [], users = [], orders = []
  let websiteSettings, response = cache.get(cache.keys.ADMIN_STORE_DATA)

  const commonProjection = { __v: false }
  const userProjection = { password: false, token: false }

  try {
    if(response) {
      Loger.text('Cache HIT, send response to client')
      return response
    }

    Loger.text('Cache MISS, get data from database')
    timer.start('READ_SETTING')
    websiteSettings = JSON.parse(await readFile(path.join(process.cwd(), 'settings.json'), { encoding: 'utf8' }))
    timer.stop('Complete getting website settings', 'READ_SETTING')

    timer.start('GETTING_PRODUCTS')
    products = await ProductModel.find({}, commonProjection)
    timer.stop('Complete getting products', 'GETTING_PRODUCTS')

    timer.start('GETTING_USERS')
    users = await UserModel.find({}, {...userProjection, ...commonProjection })
    timer.stop('Complete getting users', 'GETTING_USERS')

    timer.start('GETTING_SECTIONS')
    productsSection = await SectionModel.find({}, commonProjection, { populate: { path: 'productsID' } })
    timer.stop('Complete getting product sections', 'GETTING_SECTIONS')

    timer.start('GETTING_ORDERS')
    orders = await OrderModel.find({}, commonProjection, { populate: { path: 'toBuy._id' } })
    timer.stop('Complete getting orders', 'GETTING_ORDERS')

    timer.start('PUSHING_PRODUCTS_IN_SECTION')
    for(let index = 0; index < productsSection.length; index++) {
      productsSection[index] = {
        ...productsSection[index]._doc, 
        products: productsSection[index].productsID,
        productsID: productsSection[index].productsID.map(product => product._id)
      }
    }	
    timer.stop('Complete pushing ids in productsID and products in products', 'PUSHING_PRODUCTS_IN_SECTION')

    response = { products, productsSection, users, orders, websiteSettings }

    cache.set(cache.keys.ADMIN_STORE_DATA, response)

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}