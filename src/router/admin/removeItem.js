import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import removeImages from "../../util/data-utils/removeImages.js"

import Product from '../../model/product.model.js'
import Action from '../../model/action.model.js'
import Order from '../../model/order.model.js'
import Category from '../../model/category.model.js'

import { isValidObjectId } from "mongoose"

export default async function removeItem(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { id, from } = req.params
  
    let item

    if(!isValidObjectId(id)) return RESPONSE_404("Item id is not valid!")
    
    switch(from) {
      case 'product':
        timer.start(`Remove product by id "${id}"`)
        item = await Product.findByIdAndDelete(id)
        timer.stop('Complete')

        if(item.images.length > 0) {
          timer.start('Remove product imgs')
          await removeImages(item.images)
          timer.stop('Complete')
        }

        if(item.actionID) {
          timer.start(`Remove products ids "${item._id}" from action`)
          await Action.updateOne({ _id: item.actionID }, { $pull: { productsID: String(item._id) } })
          timer.stop('Complete')
        }

        if(item.categoryID) {
          timer.start(`Remove product id "${item._id}" from category`)
          await Category.updateOne({ _id: item.categoryID }, { $pull: { productsID: String(item._id) } })
          timer.stop('Complete')
        }

        Loger.log(`Remove cache by key "${cache.keys.PRODUCT_ID + item._id}", "${cache.keys.HOME_DATA}", "${cache.keys.ADMIN_STORE_DATA}"`)
        cache.remove(cache.keys.PRODUCT_ID + item._id)
        cache.remove(cache.keys.HOME_DATA)
        cache.remove(cache.keys.ADMIN_STORE_DATA)
      break
      case 'category':
        timer.start(`Remove category by id "${id}"`)
        item = await Category.findByIdAndDelete(id)
        timer.stop(`Complete`)

        timer.start('Set categoryID for products to null')
        await Product.updateMany({ _id: { $in: item.productsID } }, { categoryID: null })
        timer.stop('Complete')

        if(item.actionID) {
          timer.start(`Remove category id "${item._id}" from action`)
          await Action.updateOne({ _id: item.actionID }, { categoryID: null, $pull: { productsID: { $in: item.productsID } } })
          await Product.updateMany({ _id: { $in: item.productsID } }, { actionID: null })
          timer.stop('Complete')
        }

        timer.start('Remove products cache')
        for(let index = 0; index < item.productsID.length; index++) {
          Loger.log(`Removed cache "${item.productsID[index]}"`)
          cache.remove(cache.keys.PRODUCT_ID + item.productsID[index])
        }
        timer.stop('Complete')

        Loger.log(`Remove some other cache by keys "${cache.keys.ADMIN_STORE_DATA}", "${cache.keys.HOME_DATA}"`)
        cache.remove(cache.keys.ADMIN_STORE_DATA)
        cache.remove(cache.keys.HOME_DATA)
      break
      case 'order':
        let productsID = []

        timer.start(`Remove order by "${id}"`)
        item = await Order.findByIdAndDelete(id)
        timer.stop('Complete')

        timer.start('Get products ids')
        productsID = await Product.find({ _id: { $in: item.toBuy.map(product => product._id) } })
        timer.stop('Complete')

        timer.start('Remove products and cache')
        for(let index = 0; index < productsID.length; index++) {
          const product = await Product.findById(productsID[index])

          if(product.stock <= 0) {
            await Product.deleteOne({ _id: product._id })
            Loger.log(`Removed product "${product._id}"`)
            cache.remove(cache.keys.PRODUCT_ID + product._id)
          } else cache.set(cache.keys.PRODUCT_ID + product._id, product._doc)
        }
        timer.stop('Complete')
      break
      case 'action':
        let category

        timer.start(`Remove action by id "${id}"`)
        item = await Action.findByIdAndDelete(id)
        timer.stop('Complete')

        if(item.categoryID) {
          timer.start(`Set actionID "${id}" in category "${item.categoryID}" to null`)
          category = await Category.findByIdAndUpdate(item.categoryID, { actionID: null })
          await Product.updateMany({ _id: { $in: category.productsID } }, { actionID: null })
          timer.stop('Complete')
        }

        if(item.productsID.length > 0) {
          timer.start(`Set actionID "${id}" in products to null`)
          await Product.updateMany({ _id: { $in: item.productsID } }, { actionID: null })
          timer.stop('Complete')
        }
      break
    }

    return { id }
  } catch(error) {
    throw new Error(error.message)
  }
}