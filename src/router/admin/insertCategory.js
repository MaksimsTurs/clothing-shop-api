import Loger from "../../util/loger/loger.js"
import checker from "../../util/checker.js"

import Category from '../../model/category.model.js'
import Product from '../../model/product.model.js'

import { cache } from "../../../index.js"

import mongoose from "mongoose"

export default async function insertCategory(req) {
  try {
    const timer = new Loger.create.Timer()
    const { productsID } = req.body
  
    let newCategory

    timer.start()
    newCategory = await Category.create({ _id: new mongoose.Types.ObjectId(), productsID, ...checker.isNotEmpty(req.body) })
    timer.stop('Create new category')

    if(checker.isNotEmpty(productsID)) {
      timer.start()
      await Product.updateMany({ _id: { $in: productsID } }, { categoryID: newCategory._id })
      timer.stop('Update products')

      timer.start()
      for(let index = 0; index < productsID.length; index++) {
        Loger.log(`Removed cache by key "${cache.keys.PRODUCT_ID}${productsID[index]}"`)
        cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      }
      timer.stop('Remove full cache')
    }

    Loger.log(`Remove other cache with keys "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.HOME_DATA}"`)
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)

    Loger.log('Return new category')
    return newCategory._doc
  } catch(error) {
    throw new Error(error.message)
  }
}