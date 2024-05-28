import Loger from "../../util/loger/loger.js"
import checker from "../../util/checker.js"

import Action from '../../model/action.model.js'
import Product from '../../model/product.model.js'
import Category from '../../model/category.model.js'

import { cache } from '../../../index.js'

export default async function updateCategory(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { _id, productsID, actionName } = req.body
    
    let updatedCategory, updatedAction
    
    timer.start()
    updatedCategory = await Category.findByIdAndUpdate(_id, checker.isNotEmpty(req.body, ['productsID', 'actionName']), { new: true })
    timer.stop(`Find category by id "${_id}"`)
    
    const newProductsID = [...updatedCategory.productsID, ...productsID]
    
    if(checker.isNotEmpty(actionName)) {
      timer.start()
      updatedAction = await Action.findOneAndUpdate({ title: actionName }, { categoryID: updatedCategory._id, $push: { productsID: { $each: newProductsID } } })
      await Product.updateMany({ _id: { $in: newProductsID }}, { categoryID: updatedCategory._id, actionID: updatedCategory.actionID })
      updatedCategory.actionID = updatedAction._id
      timer.stop(`Find action by title "${actionName}", add "categoryID", push newProductsID into action, add "actionID" and "categoryID" to products and category`)
    }
    
    if(checker.isNotEmpty(productsID) && !actionName) {
      timer.start()
      await Product.updateMany({ _id: { $in: newProductsID } }, { categoryID: updatedCategory._id }) 
      for(let index = 0; index < productsID.length; index++) {
        Loger.log(`Remove cache by key "${cache.keys.PRODUCT_ID}${productsID[index]}"`)
        cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      }
      timer.stop(`Update some products from category "${updatedCategory.title}" and remove cache`)
    }
    
    Loger.log('Push new products id into category')
    updatedCategory.productsID = [...updatedCategory.productsID, ...productsID]
    await updatedCategory.save()

    Loger.log(`Remove cache by key "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.HOME_DATA}"`)
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)

    Loger.log('Return updated category')
    return updatedCategory._doc
  } catch(error) {
    throw new Error(error.message)
  }
}