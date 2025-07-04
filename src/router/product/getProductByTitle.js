import Loger from "../../util/loger/loger.js"

import ProductModel from '../../model/product.model.js'

export default async function getProductByTitle(req) {
  try {
    const timer = new Loger.create.Timer()
    const productProjection = { title: true, _id: true }
  
    let products

    timer.start(`Find product by title "${req.params.title}"`)
    products = await ProductModel.find({ title: { $regex: req.params.title, $options: 'i' } }, productProjection)
    timer.stop('Complete')

    return { products }
  } catch(error) {
    throw new Error(error.message)
  }
}