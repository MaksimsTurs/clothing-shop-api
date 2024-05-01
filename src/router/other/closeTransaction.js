import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from "../../util/isUndefinedOrNull.js"

import { RESPONSE_200 } from "../../constants/succes-constans.js"
import { RESPONSE_400, RESPONSE_403 } from "../../constants/error-constans.js"

import jwt from 'jsonwebtoken'
import mongoose from "mongoose"

import ProductModel from '../../model/productModel.js'
import OrderModel from '../../model/orderModel.js'
import SectionModel from '../../model/productSectionModel.js'

import { cache } from "../../../index.js"

export default async function closeTransaction(req, res) {  
  try {
    const timer = new Loger.create.Timer()
    const { checkID, adress, token } = req.body
  
    const { products } = cache.get(checkID)
  
    let product, section, tokenData
    let orderProducts = []

    Loger.log('Check is adress not empty')
    if(isUndefinedOrNull(adress)) return RESPONSE_400("Adress cann not be empty!")

    Loger.log('Verifying token')
    tokenData = jwt.verify(token, process.env.CREATE_TOKEN_SECRET)

    if(!tokenData) return RESPONSE_403("You need authorizate!")

    timer.start('Update products stock and push products in order')
    for(let index = 0; index < products.length; index++) {
      product = await ProductModel.findById(products[index]._id)
      
      const newStock = product.stock - products[index].count
      
      if(newStock <= 0) product.stock = 0
      else product.stock = newStock
      
      if(newStock <= 0) {
        section = await SectionModel.findOne({ productsID: products[index]._id })
        
        if(section) {
          section.productsID = section.productsID.filter(id => String(id) !== String(product._id))
          await section.save()
        }
      }

      orderProducts.push({
        _id: products[index]._id,
        count: products[index].count,
        title: product.title,
        precent: section?.precent || product?.precent,
        price: product?.price,
        images: product?.images[0]
      })

      await product.save()
    }    
    timer.stop('Complete updating products stock and pushing in order')

    timer.start('Create order')
    await OrderModel.create({ _id: new mongoose.Types.ObjectId(), toBuy: orderProducts, adress, userID: tokenData.id })
    timer.stop('Complete creating order')

    return RESPONSE_200("Complete closing transaction!")
  } catch(error) {
    throw new Error(error.message)
  }
}