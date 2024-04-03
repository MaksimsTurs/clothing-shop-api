import loger from "../util/loger.js"
import isAuthorizated from '../util/isAuthorizated.js'
import isUndefinedOrNull from '../util/isUndefinedOrNull.js'

import { RESPONSE_500 } from "../constants/error-constans.js"

import UserModel from "../model/userModel.js"
import ProductModel from '../model/productModel.js'
import SectionModel from '../model/productSectionModel.js'
import OrderModel from '../model/order.js'

import convertAndSave from '../util/data-utils/convertAndSave.js'

import mongoose from 'mongoose'

const common = {
  getAll: async (req, res) => {
    const { originalUrl, body, params } = req
    loger.request(originalUrl, body, params)

    let products = [], sections = [], users = []
    let usersNumber = 0, productsNumber = 0, brandsNumber = 0
    
    try {
      products = await ProductModel.find()
      users = await UserModel.find()
      sections = await SectionModel.find({}, undefined, { populate: { path: 'productsID' } })
    } catch(error) {
      res.status(500).send(RESPONSE_500())
      return loger.error(error, '/controller/common.js', 'Get data from database.')
    }

    try {
      usersNumber  = users.length
      productsNumber = products.length
      brandsNumber = 0

      const response = { 
        products, 
        sections: sections.map(section => ({...section._doc, products: section.productsID })),  
        usersNumber,
        productsNumber,
        brandsNumber
      }

      res.status(200).send(response)
      return loger.response(response)
    } catch(error) {
      res.status(500).send(RESPONSE_500())
      loger.error(error, '/controller/common.js', 'Pass data into response object and send to the client')
    }
  },
  editUserData: async (req, res) => {
    const { originalUrl, body, file, files, params } = req
    loger.request(originalUrl, body, params)

    const { token, firstName, secondName, email } = body

    const { code, message, existedUser } = await isAuthorizated(token)

    if(code !== 200) return res.status(code).send({ code, message })

    let user = {}
    let avatar = ''

    try { 
      avatar = await convertAndSave(file || files, 50),
      user = await UserModel.findByIdAndUpdate(existedUser._id, {
        firstName: firstName || existedUser.firstName,
        secondName: secondName || existedUser.secondName,
        email: email || existedUser.email,
        avatar: avatar[0]
      }, { new: true })

      const response = { firstName: user.firstName, secondName: user.secondName, avatar: user.avatar, token: user.token }

      res.status(200).send(response)
      return loger.response(response)
    } catch(error) {
      loger.error(error, '/controller/common.js', 'Edit user data.')
			return res.status(500).send(RESPONSE_500())
    }
  },
  checkout: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { productsInfo } = body

    let products = [], productIDs = productsInfo.map(product => product.id), productsRes = []
    let totalCost = 0, deliveryCost = 15, discount = 0, totalProductsCost = 0

    try {
      products = await ProductModel.find({ _id: { $in: productIDs } })
      
      for(let index = 0; index < products.length; index++) {
        const currProduct = products[index]
        const currProductInfo = productsInfo[index]
        const priceWithPrecent = currProduct.price - (currProduct.price * (currProduct?.precent || 0)) //Calculate price of curr product with precent

        //When was more selected as we have
        if(currProduct.stock < currProductInfo.count) {
          totalCost += priceWithPrecent * currProduct.stock
          discount += (currProduct.price * currProduct.stock) - (priceWithPrecent * currProduct.stock)
          totalProductsCost += currProduct.precent * currProduct.stock
        } else {
          totalCost += priceWithPrecent * productsInfo[index].count
          discount += (currProduct.price * productsInfo[index].count) - (priceWithPrecent * productsInfo[index].count)
          totalProductsCost += currProduct.price * productsInfo[index].count

          productsRes.unshift({...currProduct._doc, count: productsInfo[index].count})
        }
      }

      totalCost += deliveryCost

      totalCost = totalCost.toFixed(2)
      discount = discount.toFixed(2)
      deliveryCost = deliveryCost.toFixed(2)
      totalProductsCost = totalProductsCost.toFixed(2)

      res.status(200).send({ products: productsRes, totalCost, deliveryCost, discount, totalProductsCost })
      return loger.logResponse({ products: productsRes, totalCost, deliveryCost, discount, totalProductsCost })
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
        const product = await ProductModel.findOnde({ _id: productIDs[index].id })

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