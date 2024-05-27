import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from "../../util/isUndefinedOrNull.js"
import isDefined from "../../util/isDefined.js"

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
    updatedCategory = await Category.findByIdAndUpdate(_id, {...isDefined.assign(req.body).check(['actionName']) })
    timer.stop(`Find category by id "${_id}" and update`)

    if(!isDefined.isEmptyString(actionName)) {
      timer.start()
      updatedAction = await Action.findOneAndUpdate({ title: actionName }, { categoryID: updatedCategory._id, productsID: [...updatedCategory.productsID, ...productsID] })
      await Product.updateMany({ _id: { $in: [...updatedCategory.productsID, ...productsID] }}, { categoryID: updatedCategory._id, actionID: updatedCategory.actionID })
      updatedCategory.actionID = updatedAction._id
      timer.stop(`Find action by title "${actionName}", update products and category`)
    }
    
    if(productsID.length > 0) {
      timer.start()
      await Product.updateMany({ _id: { $in: productsID } }, { categoryID: updatedCategory._id }) 
      for(let index = 0; index < productsID.length; index++) {
        Loger.log(`Remove cache by key "${cache.keys.PRODUCT_ID}${productsID[index]}"`)
        cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      }
      timer.stop(`Update products where have relation with category "${updatedCategory.title}"`)
    }

    Loger.log(`Save updated section and cache by key "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.HOME_DATA}"`)
    await updatedCategory.save()
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)

    return updatedCategory._doc
  } catch(error) {
    throw new Error(error.message)
  }
}