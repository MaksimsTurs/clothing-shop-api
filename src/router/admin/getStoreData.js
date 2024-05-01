import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import { readFile } from "fs/promises"
import path from "path"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import UserModel from '../../model/userModel.js'
import OrderModel from '../../model/orderModel.js'

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
    timer.start('Read website settins')
    websiteSettings = JSON.parse(await readFile(path.join(process.cwd(), 'settings.json'), { encoding: 'utf8' }))
    timer.stop('Complete getting website settings')

    timer.start('Get all products')
    products = await ProductModel.find({}, commonProjection)
    timer.stop('Complete getting products')

    timer.start('Get all users')
    users = await UserModel.find({}, {...userProjection, ...commonProjection })
    timer.stop('Complete getting users')

    timer.start('Get all sections')
    productsSection = await SectionModel.find({}, commonProjection, { populate: { path: 'productsID' } })
    timer.stop('Complete getting product sections')

    timer.start('Get all orders')
    orders = await OrderModel.find({}, commonProjection, { populate: { path: 'toBuy._id' } })
    timer.stop('Complete getting orders')

    timer.start('Pushing products in section')
    for(let index = 0; index < productsSection.length; index++) {
      productsSection[index] = {
        ...productsSection[index]._doc, 
        products: productsSection[index].productsID,
        productsID: productsSection[index].productsID.map(product => product._id)
      }
    }	
    timer.stop('Complete pushing ids in productsID and products in products')

    response = { products, productsSection, users, orders, websiteSettings }

    cache.set(cache.keys.ADMIN_STORE_DATA, response)

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}