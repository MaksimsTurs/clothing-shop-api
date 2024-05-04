import Loger from "../../util/loger/loger.js"

import { RESPONSE_200 } from "../../constants/succes-constans.js"
import { RESPONSE_403, RESPONSE_404 } from "../../constants/error-constans.js"

import mongoose, { isValidObjectId } from "mongoose"
import { validationResult } from "express-validator"

import ProductModel from '../../model/productModel.js'
import OrderModel from '../../model/orderModel.js'
import SectionModel from '../../model/productSectionModel.js'
import UserModel from '../../model/userModel.js'

import { cache } from "../../../index.js"

export default async function closeTransaction(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { checkID, adress, city, plz, id, firstName, secondName, email } = req.body

    timer.start('Starting validating user input')
    const valRes = validationResult(req.body)
    timer.stop('Complete validating user input')

    if(!valRes.isEmpty()) return valRes.array({ onlyFirstError: true })

    const { products } = cache.get(checkID)
  
    let product, section, user
    let orderProducts = []

    if(isValidObjectId(id) && (!firstName && !secondName && !email)) {
      timer.start(`Finding user by id ${id}`)
      user = await UserModel.findById(id)
      timer.stop(`Complete finding user by id ${id}`) 
      if(!user) return RESPONSE_404('User not found, you cann make order as Gast!')
    } else if((!firstName || !secondName || !email) && !id) return RESPONSE_403('Pass data into inputs fileds!')


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
    await OrderModel.create({ 
      _id: new mongoose.Types.ObjectId(), 
      toBuy: orderProducts, 
      firstName: firstName || user.firstName,
      secondName: secondName || user.secondName,
      email: email || user.email,
      adress,
      city,
      plz
    })
    timer.stop('Complete creating order')

    return RESPONSE_200("Complete closing transaction!")
  } catch(error) {
    throw new Error(error.message)
  }
}