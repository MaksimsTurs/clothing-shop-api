import Loger from "../../util/loger/loger.js"
import checker from "../../util/checker.js"

import Action from '../../model/action.model.js'
import Product from '../../model/product.model.js'
import Category from '../../model/category.model.js'

import { cache } from "../../../index.js"

import mongoose from "mongoose"

export default async function insertProductAction(req) {
  try {
    const timer = new Loger.create.Timer()
    const { productsID, categoryName } = req.body
  
    let newAction

    timer.start()
    newAction = new Action({ _id: new mongoose.Types.ObjectId(), ...checker.isNotEmpty(req.body, ['categoryName']) })
    timer.stop('Create new action')

    if(checker.isNotEmpty(categoryName)) {
      timer.start()
      newAction.categoryID = (await Category.findOneAndUpdate({ title: categoryName }, { actionID: newAction._id }))._id
      timer.stop(`Find category by title "${categoryName}" and add "categoryID" in to action "${req.body.title}"`)
    }

    if(checker.isNotEmpty(productsID)) {
      timer.start()
      await Product.updateMany({ _id: { $in: productsID } }, { actionID: newAction._id })
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

    Loger.log('Save new action')
    await newAction.save()

    Loger.log('Return new action')
    return newAction._doc
  } catch(error) {
    throw new Error(error.message)
  }
}