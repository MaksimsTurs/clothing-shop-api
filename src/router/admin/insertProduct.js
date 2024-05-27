import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from '../../util/isUndefinedOrNull.js'
import isDefined from "../../util/isDefined.js"

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import { cache } from '../../../index.js'

import Product from '../../model/product.model.js'
import Action from '../../model/action.model.js'
import Category from '../../model/category.model.js'

import mongoose from "mongoose"

import { RESPONSE_400 } from "../../constants/error-constans.js"

export default async function insertProduct(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { body, files } = req
    const { category, action } = body
  
    let newProduct, updatedCategory
    let images = []

    if(files.length > 0) {
      timer.start()
      images = await convertAndSave(files, 50)
      timer.stop(`Convert image to "WEBP" and save, quality ${50}`)
    }

    timer.start()
    newProduct = new Product({ _id: new mongoose.Types.ObjectId(), images, ...isDefined.assign(req.body).check(['action', 'category']) })
    timer.stop('Create new product')	

    if(!isDefined.isEmptyString(action)) {
      timer.start()
      newProduct.actionID = (await Action.findOneAndUpdate({ title: action }, { $push: { productsID: newProduct._id } }, { new: true }))._id
      timer.stop('Update action and add "actionID" in to product')
    }

    if(!isDefined.isEmptyString(category)) {
      timer.start()
      updatedCategory = await Category.findOneAndUpdate({ title: category }, { $push: { productsID: newProduct._id } }, { new: true })
      newProduct.categoryID = updatedCategory._id

      if(action && updatedCategory.actionID) {
        Loger.error(`Category "${updatedCategory.title}" has a action, id "${updatedCategory.actionID}"`, import.meta.url)
        return RESPONSE_400("Category is alredy in action!")
      }
      
      if(updatedCategory.actionID) {
        timer.start()
        await Action.findOneAndUpdate({ _id: updatedCategory.actionID }, { $push: { productsID: newProduct._id } })
        newProduct.actionID = updatedCategory.actionID
        timer.stop(`Push "${newProduct._id}" into action with id "${updatedCategory.actionID}"`)
      }
      timer.stop('Update category and add "categoryID" in to product')
    }	
    
    timer.start()
    await newProduct.save()
    timer.stop('Save product')

    Loger.log(`Remove and update cache with keys "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.HOME_DATA}", "${cache.keys.PRODUCT_ID + newProduct._id}"`)
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)
    cache.set(cache.keys.PRODUCT_ID + newProduct._id)

    Loger.log('Return new product document')
    return newProduct._doc
  } catch(error) {
    throw new Error(error.message)
  }
} 