import Loger from "../../util/loger/loger.js"
import isDefined from "../../util/isDefined.js"

import Action from '../../model/action.model.js'
import Product from '../../model/product.model.js'
import Category from '../../model/category.model.js'

import { cache } from '../../../index.js'

export default async function updateProductAction(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { _id, productsID, categoryName } = req.body
    
    let updatedAction, updatedCategory

    timer.start()
    updatedAction = await Action.findByIdAndUpdate(_id, {...isDefined.assign(req.body).check(['categoryName']) })
    timer.stop(`Find action by id "${_id}"`)
    
    if(!isDefined.isEmptyString(categoryName)) {
      timer.stop()
      updatedCategory = await Category.findOneAndUpdate({ title: categoryName }, { actionID: _id })
      updatedAction.categoryID = updatedCategory._id
      await Product.updateMany({ _id: { $in: updatedCategory.productsID } }, { actionID: updatedAction._id }) 
      for(let index = 0; index < updatedCategory.productsID.length; index++) {
        Loger.log(`Remove cache key "${cache.keys.PRODUCT_ID}${productsID[index]}}"`)
        cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      }
      timer.stop(`Find category by name "${categoryName}"`)
    }
    
    if(productsID.length > 0) {
      timer.start()
      await Product.updateMany({ _id: { $in: productsID }}, { actionID: updatedAction._id }) 
      for(let index = 0; index < productsID.length; index++) {
        Loger.log(`Remove product cache by id "${productsID[index]}}"`)
        cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      }
      timer.stop(`Update products where have relation with action "${updatedAction.title}"`)
    }

    Loger.log(`Save updated section and cache by key "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.HOME_DATA}"`)
    await updatedAction.save()
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)

    return updatedAction._doc
  } catch(error) {
    throw new Error(error.message)
  }
}