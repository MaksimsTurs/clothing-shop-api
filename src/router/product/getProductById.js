import { isValidObjectId } from "mongoose"

import Loger from "../../util/loger/loger.js"

export default async function getProductById() {
  const timer = new Loger.create.Timer()
  const productProjection = { __v: false, createdAt: false, updatedAt: false }

  let product = cache.get(cache.keys.PRODUCT_ID + params.id)
  
  try {
    Loger.text('Check id validity')
    if(!isValidObjectId(params.id)) return RESPONSE_404("Product not found!")

    if(product) {
      timer.stop('Cache HIT, send to client...', 'EXECUTION_TIME')
      return product
    }

    Loger.text('Cache MISS, get data from database')
    timer.start('GETTING_PRODUCT')   
    product = await ProductModel.findOne({ _id: params.id, stock: { $gte: 0 } }, productProjection)
    timer.stop('Complete getting product', 'GETTING_PRODUCT')

    if(!product) return RESPONSE_404("Product not found!")

    Loger.text('Updating cache')
    cache.set(cache.keys.PRODUCT_ID + params.id, {...product._doc })
    
    return product._doc
  } catch(error) {
    throw new Error(error.message)
  }
}