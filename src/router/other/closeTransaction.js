import Loger from "../../util/loger/loger.js"

import { RESPONSE_200 } from "../../constants/succes-constans.js"
import { RESPONSE_400, RESPONSE_403 } from "../../constants/error-constans.js"

import jwt from 'jsonwebtoken'

export default async function closeTransaction(req, res) {
  const timer = new Loger.create.Timer()
  const { checkID, adress, token } = body

  const { products } = cache.get(checkID)

  let product, section, tokenData
  let orderProducts = []

  try {
    Loger.text('Check is adress was added')
    if(isUndefinedOrNull(adress)) {
      res.status(400).send(RESPONSE_400("Adress cann not be empty!"))
      return Loger.response(RESPONSE_400("Adress cann not be empty!"))  
    }

    Loger.text('Verifying token')
    tokenData = jwt.verify(token)

    if(!tokenData) return RESPONSE_403("You need authorizate!")

    timer.start('UPDATE_PRODUCTS_STOKE')
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
    timer.stop('Complete finding, updating products stock and pushing order', 'UPDATE_PRODUCTS_STOKE')

    timer.start('CREATE_ORDER')
    await OrderModel.create({ _id: new mongoose.Types.ObjectId(), toBuy: orderProducts, adress, userID: tokenData._id })
    timer.stop('Complete creating order', 'CREATE_ORDER')

    return RESPONSE_200("Complete closing transaction!")
  } catch(error) {
    throw new Error(error.message)
  }
}