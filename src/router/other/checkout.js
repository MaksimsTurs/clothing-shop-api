import Loger from "../../util/loger/loger.js"

import { readFile } from "fs/promises"

import ProductModel from '../../model/productModel.js'

import { cache } from "../../../index.js"

export default async function checkout(req, res) {
    const timer = new Loger.create.Timer()

    const { body } = req

    let response = { products: [], totalItemsPrice: 0, totalPriceWithDiscount: 0, totalOrderPrice: 0, delivery: 15, discount: 0, warnings: [] }
  
    if(!body) {
      timer.stop('Body is undefined, send default response to client', 'EXECUTION_TIME')
      return response
    }

    const productProjection = { __v: false, createdAt: false, updatedAt: false, }

    const checkID = (Math.random() * 5000000).toString(32)

    const productsID = body.map(product => product._id)

    try {
      timer.start('GETTING_DELIVERY')
      response.delivery = JSON.parse(await readFile(`${process.cwd()}/settings.json`, { encoding: 'utf-8' }))['deliveryFee']
      timer.stop('Complete getting delivery fee from setting.json', 'GETTING_DELIVERY')

      timer.start('FILTERING_PRODUCTS')
      response.products = await ProductModel.find({ _id: { $in: productsID } }, productProjection)
      timer.stop('Complete filtering products', 'FILTERING_PRODUCTS')

      timer.start('CALCULATE_CART_PRICE')
      for(let index = 0; index < response.products.length; index++) {
        let currProduct = response.products[index]
        
        //Count will be needed to understend how many product this type user have ordered
        const newCount = currProduct.stock - body[index].count

        if(newCount <= 0) {
          currProduct._doc.count = response.products[index].stock
          if(!response.warnings.includes('COUNT_BIGGER_THEN_STOCK')) response.warnings.push('COUNT_BIGGER_THEN_STOCK')
        } else currProduct._doc.count = body[index].count

        response.totalPriceWithDiscount += +((currProduct.price - (currProduct.price * currProduct.precent || 0)) * currProduct._doc.count).toFixed(2)
        response.totalItemsPrice += +(currProduct.price * currProduct._doc.count).toFixed(2) 
        
        response.products[index] = currProduct
      }
      timer.stop('Complete calculate cart price', 'CALCULATE_CART_PRICE')
      
      response.discount = +(response.totalItemsPrice - response.totalPriceWithDiscount).toFixed(2)
      response.totalOrderPrice = +(response.totalPriceWithDiscount + +response.delivery).toFixed(2)

      Loger.text('Caching and sending response to client', 'EXECUTION_TIME')
      cache.set(checkID, { totalOrderPrice: response.totalOrderPrice, products: response.products.map(product => ({ _id: product._id, count: product._doc.count })) })

      return {...response, checkID }
    } catch(error) {
      throw new Error(error.message)
    }
  }