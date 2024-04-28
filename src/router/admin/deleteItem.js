import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import removeImages from "../../util/data-utils/removeImages.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import OrderModel from '../../model/orderModel.js'

import { isValidObjectId } from "mongoose"

export default async function deleteItem(req) {
  const timer = new Loger.create.Timer()
  const { id, from } = req.params

  let item

  try {
    Loger.text('Check is id valid')
    if(!isValidObjectId(id)) return RESPONSE_404("Item id is not valid!")
    
    switch(from) {
      case 'product':
        timer.start('DELETE_PRODUCT')
        item = await ProductModel.findByIdAndDelete(id)
        timer.stop('Complete deleting product', 'DELETE_PRODUCT')

        timer.start('DELETE_IMG')
        if(item && item.images.length > 0) await removeImages(item.images)
        timer.stop('Complete deleting product img', 'EDLETE_IMG')

        timer.start('UPDATE_PRODUCT_SECTION')
        if(item.sectionID) section = await SectionModel.updateOne({ _id: item.sectionID }, { $pull: { productsID: String(item._id) } })
        timer.stop('Complete updating sections', 'UPDATE_PRODUCT_SECTION')

        cache.remove(cache.keys.PRODUCT_ID + product._id)
        cache.remove(cache.keys.HOME_DATA)
        cache.remove(cache.keys.ADMIN_STORE_DATA)
      break;
      case 'section':
        timer.start('REMOVE_SECTION')
        item = await SectionModel.findByIdAndDelete(id)
        timer.stop('Complete removing section', 'REMOVE_SECTION')

        timer.start('UPDATING_PRODUCTS')
        await ProductModel.updateMany({ _id: { $in: item.productsID } }, { precent: null, sectionID: null, category: null })
        timer.stop('Complete updating products', 'UPDATING_PRODUCTS')

        timer.start('REMOVE_CACHE')
        for(let index = 0; index < item.productsID.length; index++) cache.remove(cache.keys.PRODUCT_ID + item.productsID[index])
        timer.stop('Complete removing cache', 'REMOVE_CACHE')
      break;
      case 'order':
        let productsID = []

        timer.start('DELETE_ORDER')
        item = await OrderModel.findByIdAndDelete(id)
        timer.stop('Complete removing order', 'DELETE_ORDER')

        timer.start('GETTING_PRODUCT_ORDER_DATA')
        productsID = await ProductModel.find({ _id: { $in: item.toBuy.map(product => product._id) } })
        timer.stop('Complete getting products from order', 'GETTING_PRODUCT_ORDER_DATA')

        timer.start('REMOVE_PRODUCTS_AND_CACHE')
        for(let index = 0; index < productsID.length; index++) {
          const product = await ProductModel.findById(productsID[index])

          if(product.stock <= 0) {
            await ProductModel.findByIdAndDelete(product._id)
            cache.remove(cache.keys.PRODUCT_ID + product._id)
          } else cache.set(cache.keys.PRODUCT_ID + product._id)
        }
        timer.stop('Complete deleting products where have stock equal to 0', 'REMOVE_PRODUCTS_AND_CACHE')
      break;
    }

    return { id }
  } catch(error) {
    throw new Error(error.message)
  }
}