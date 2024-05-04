import Loger from "../../util/loger/loger.js"

import ProductModel from '../../model/productModel.js'
import WebsiteSettingsModel from '../../model/websiteSetting.js'

import { cache } from "../../../index.js"

import crypto from 'crypto'

export default async function checkout(req) {
    try {
      const timer = new Loger.create.Timer()

      if(!req.body) return response
  
      let response = { products: [], totalItemsPrice: 0, totalPriceWithDiscount: 0, totalOrderPrice: 0, delivery: 0, discount: 0, warnings: [] }
  
      const productProjection = { __v: false, createdAt: false, updatedAt: false, description: false, sectionID: false, category: false }
      const checkID = crypto.randomUUID()
      const productsID = req.body.map(product => product._id)

      timer.start('Get products by id')
      response.products = await ProductModel.find({ _id: { $in: productsID } }, productProjection)
      timer.stop('Complete getting products')

      timer.start('Calculate products price, discount and order price')
      for(let index = 0; index < response.products.length; index++) {
        let currProduct = response.products[index]
        
        //Count will be needed to understend how many product this type user have ordered
        const newCount = currProduct.stock - req.body[index].count

        if(newCount <= 0) {
          currProduct._doc.count = response.products[index].stock
          if(!response.warnings.includes('COUNT_BIGGER_THEN_STOCK') && newCount < 0) response.warnings.push('COUNT_BIGGER_THEN_STOCK')
        } else currProduct._doc.count = req.body[index].count

        response.totalPriceWithDiscount += +((currProduct.price - (currProduct.price * currProduct.precent || 0)) * currProduct._doc.count)
        response.totalItemsPrice += +(currProduct.price * currProduct._doc.count)
        
        response.products[index] = currProduct
      }
      timer.stop('Complete calculate products price, discount and order price')
      
      
      Loger.log('Assign discount, total order price and delivery')
      response.discount = +(response.totalItemsPrice - response.totalPriceWithDiscount).toFixed(2)
      response.totalItemsPrice = +(response.totalItemsPrice).toFixed(2)
      response.totalPriceWithDiscount = +(response.totalPriceWithDiscount).toFixed(2)
      
      if(response.totalPriceWithDiscount < 100) {
        timer.start('Get delivery fee price from settings')
        response.delivery = parseFloat((await WebsiteSettingsModel.find())[0].deliveryFee)
        timer.stop('Complete getting delivery fee price from settings')
      } else response.delivery = 0
      response.totalOrderPrice = +(response.totalPriceWithDiscount + +response.delivery).toFixed(2)
      
      Loger.log('Cache order')
      cache.set(checkID, { totalOrderPrice: response.totalOrderPrice, products: response.products.map(product => ({ _id: product._id, count: product._doc.count })) })

      return {...response, checkID }
    } catch(error) {
      throw new Error(error.message)
    }
  }