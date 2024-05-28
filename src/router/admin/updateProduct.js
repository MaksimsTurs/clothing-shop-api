import Loger from "../../util/loger/loger.js"
import checker from "../../util/checker.js"

import Product from '../../model/product.model.js'
import Action from '../../model/action.model.js'
import Category from '../../model/category.model.js'

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import { cache } from "../../../index.js"

export default async function updateProduct(req) {
  try {
    const timer = new Loger.create.Timer()
    const { files } = req
    let { category, _id, action } = req.body 
  
    let updatedProduct
    let imgs = []

    if(files.length > 0) {
      timer.start()
      imgs = await convertAndSave(files, 50)
      timer.stop(`Convert image to "WEBP" and save, quality ${50}`)
    }

    timer.start()
    updatedProduct = await Product.findById(_id)
    timer.stop(`Get products by id "${_id}"`)

    if(checker.isNotEmpty(category)) {
      timer.start()
      updatedProduct.categoryID = (await Category.findOneAndUpdate({ title: category }, { $push: { productsID: _id } }))._id
      await updatedProduct.save()
      timer.stop(`Push product id "${_id}" into category "${category}"`)
    }

    if(checker.isNotEmpty(action)) {
      timer.start()
      updatedProduct.actionID = (await Action.findOneAndUpdate({ title: action }, { $push: { productsID: _id } }))._id
      await updatedProduct.save()
      timer.stop(`Push product id "${_id}" into action "${actions}"`)
    }

    timer.start()
    updatedProduct = await Product.findByIdAndUpdate(_id, { images: imgs.length > 0 ? imgs : updatedProduct.images, ...checker.isNotEmpty(req.body, ['action', 'category']) }, { new: true })
    timer.stop('Updating product and return new Document')

    Loger.log(`Remove cache by key "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.HOME_DATA}", "${cache.keys.PRODUCT_ID + _id}"`)
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)
    cache.set(cache.keys.PRODUCT_ID + _id, updatedProduct._doc)

    Loger.log('Return updated product')
    return updatedProduct._doc
  } catch(error) {
    throw new Error(error.message)
  }
}