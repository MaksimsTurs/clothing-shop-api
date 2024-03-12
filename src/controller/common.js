import loger from "../util/loger.js"
import isAuthorizated from '../util/isAuthorizated.js'
import isUndefinedOrNull from '../util/isUndefinedOrNull.js'
import { invalidateCacheKey } from '../util/cache.js'

import { RESPONSE_500 } from "../constants/error-constans.js"

import UserModel from "../model/userModel.js"
import ProductModel from '../model/productModel.js'
import SectionModel from '../model/productSectionModel.js'
import OrderModel from '../model/order.js'

import saveImages from '../data-utils/saveImages.js'
import findMany from '../data-utils/findMany.js'
import findOne from "../data-utils/findOne.js"

import mongoose from 'mongoose'

const common = {
  editUserData: async (req, res) => {
    const { protocol, hostname, originalUrl, body, file, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { token, firstName, secondName, email } = body
    const newAvatar = file

    const { code, message, existedUser } = await isAuthorizated(token)

    if(code !== 200) return res.status(code).send({ code, message })
    
    let user = {}

    try { 
      user = await UserModel.findByIdAndUpdate(existedUser._id, {
        firstName: firstName || existedUser.firstName,
        secondName: secondName || existedUser.secondName,
        email: email || existedUser.email,
        avatar: isUndefinedOrNull(existedUser.avatar) ? await saveImages(newAvatar) : existedUser.avatar,
        token: existedUser.token
      })

      invalidateCacheKey('users')
      invalidateCacheKey(`user-${existedUser._id}`)
      
      loger.logResponse(user)
      return res.status(200).send(user)
    } catch(error) {
      loger.logError(error, import.meta.url, '30 - 42')
			return res.status(500).send(RESPONSE_500())
    }
  },
  websiteStatistic: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    let usersLenght = 0, productsLenght = 0, brandsLenght = 0

    try {
      usersLenght = (await findMany({ model: UserModel, cacheKey: 'users' })).length
      productsLenght = (await findMany({ model: ProductModel, cacheKey: 'products' })).length

      loger.logResponse({ usersLenght, productsLenght, brandsLenght })
      return res.status(200).send({ usersLenght, productsLenght, brandsLenght })
    } catch(error) {ö
      loger.logError(error, import.meta.url, '55 - 59')
      return res.status(500).send(RESPONSE_500())
    }   
  },
  checkout: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { productIDs } = body

    let products = []
    let totalCost = 0, deliveryCost = 15, discount = 0, totalProductsCost = 0

    try {
      for(let index = 0; index < productIDs.length; index++) {
        const product = await findOne({ model: ProductModel, cacheKey: `product-${productIDs[index].id}`, condition: { _id: productIDs[index].id } })
        const priceWithPrecent = product.price - (product.price * (product?.precent || 0))
        
        if(product.stock < productIDs[index].count) {       
          totalCost += priceWithPrecent * product.stock
          discount += (product.price * product.stock) - (priceWithPrecent * product.stock)
          totalProductsCost += product.price * product.stock

          products.unshift({...product._doc, count: product.stock})
        } else {
          totalCost += priceWithPrecent * productIDs[index].count
          discount += (product.price * productIDs[index].count) - (priceWithPrecent * productIDs[index].count)
          totalProductsCost += product.price * productIDs[index].count

          products.unshift({...product._doc, count: productIDs[index].count})
        }

      }

      totalCost += deliveryCost

      totalCost = totalCost.toFixed(2)
      discount = discount.toFixed(2)
      deliveryCost = deliveryCost.toFixed(2)
      totalProductsCost = totalProductsCost.toFixed(2)

      loger.logResponse({ products, totalCost, deliveryCost, discount, totalProductsCost })
      return res.status(200).send({ products, totalCost, deliveryCost, discount, totalProductsCost })
    } catch(error) {
      loger.logError(error, import.meta.url, '75 - 101')
      return res.status(500).send(RESPONSE_500())
    }
  },
  buy: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { productIDs } = body

    let toDelete = [], toBuy = []

    try {
      for(let index = 0; index < productIDs.length; index++) {
        const product = await findOne({ model: ProductModel, cacheKey: `product-${productIDs[index].id}`, condition: { _id: productIDs[index].id } })

        let newStock = product.stock - productIDs[index].count

        if(newStock <= 0) {
          toDelete.unshift(productIDs[index].id)
          toBuy.unshift(productIDs[index])
        }
        
        if(newStock > 0) {
          await ProductModel.updateOne({ _id: productIDs[index].id }, { stock: newStock })
          toBuy.unshift({ id: productIDs[index].id, count: newStock })
        }

        if(productIDs[index].sectionID) await SectionModel.updateOne({ _id: productIDs[index].sectionID }, { productID: { $pull: productIDs[index].id } })
      
        invalidateCacheKey(`product-${productIDs[index].id}`)
        invalidateCacheKey('products-section')
        invalidateCacheKey('product')
      }

      await ProductModel.deleteMany({ _id: { $in: toDelete } })
      await (new OrderModel({ _id: new mongoose.Types.ObjectId(), toBuy })).save()
    } catch(error) {
      loger.logError(error, import.meta.url, '55 - 59')
      return res.status(500).send(RESPONSE_500())
    }

    return res.status(200).send({ code: 200, message: 'Succes!' })
  }
}

export default common