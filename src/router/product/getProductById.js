import { isValidObjectId } from "mongoose"

import Loger from "../../util/loger/loger.js"
import isNewUser from "../../util/isNewUser.js"
import isAuth from "../../util/isAuth.js"
import getAuthHeader from "../../util/getAuthHeader.js"

import Product from "../../model/product.model.js"

import { cache } from '../../../index.js'

import { RESPONSE_404 } from "../../constants/error-constans.js"

export default async function getProductById(req) {  
  try {
    const timer = new Loger.create.Timer()
  
    let product = cache.get(cache.keys.PRODUCT_ID + req.params.id)

    // if(product) {
    //   Loger.log('Cache HIT, send to client')
    //   return product
    // }

    timer.start()
    const user = await isAuth(getAuthHeader(req))
    const isNew = isNewUser(user.createdAt)
    timer.start('Get user by token when authorizated')

    Loger.log('Cache MISS, get data from database')
    Loger.log(`Check id validity "${req.params.id}"`)
    if(!isValidObjectId(req.params.id)) return RESPONSE_404("Product not found!")

    timer.start(`Finding product by id "${req.params.id}"`)   
    product = await Product.findOne({ _id: req.params.id }, undefined, { populate: ['actionID', 'categoryID'] })
    if(product?.actionID) {
      product._doc.precent = product?.actionID?.precent || 0
      product._doc.actionID = product?.actionID?._id
    } else if(isNew) product._doc.precent = user.precent

    product._doc.category = product?.categoryID?.title
    product._doc.categoryID = product?.categoryID?._id
    timer.stop('Complete')

    if(!product) {
      Loger.log(`Product by id "${req.params.id}" not found`)
      return RESPONSE_404("Product not found!")
    }

    Loger.log('Updating cache')
    cache.set(cache.keys.PRODUCT_ID + req.params.id, {...product._doc })
    
    return product._doc
  } catch(error) {
    throw new Error(error.message)
  }
}