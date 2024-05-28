import Loger from "../../util/loger/loger.js"
import checker from "../../util/checker.js"

import Category from '../../model/category.model.js'
import Product from '../../model/product.model.js'
import Action from "../../model/action.model.js"

import { cache } from "../../../index.js"

import mongoose from "mongoose"

export default async function insertCategory(req) {
  try {
    const timer = new Loger.create.Timer()
    const { productsID, actionName } = req.body
  
    let newCategory

    timer.start()
    newCategory = await Category.create({ _id: new mongoose.Types.ObjectId(), productsID, ...checker.isNotEmpty(req.body, 'actionName') })
    timer.stop('Create new category')

    if(checker.isNotEmpty(actionName)) {
      timer.start()
      newCategory.actionID = (await Action.findOneAndUpdate({ title: actionName }, { categoryID: newCategory._id }))._id
      timer.stop(`Find action by title "${actionName}" and add "categoryID" in to action "${req.body.title}"`)
    }

    if(checker.isNotEmpty(productsID)) {
      timer.start()
      await Product.updateMany({ _id: { $in: productsID } }, { categoryID: newCategory._id })
      timer.start()
      for(let index = 0; index < productsID.length; index++) {
        Loger.log(`Removed cache by key "${cache.keys.PRODUCT_ID}${productsID[index]}"`)
        cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      }
      timer.stop('Remove cache and update some products')
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