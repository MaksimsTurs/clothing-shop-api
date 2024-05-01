import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import removeImages from "../../util/data-utils/removeImages.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import OrderModel from '../../model/orderModel.js'

import { isValidObjectId } from "mongoose"

export default async function deleteItem(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { id, from } = req.params
  
    let item

    if(!isValidObjectId(id)) return RESPONSE_404("Item id is not valid!")
    
    switch(from) {
      case 'product':
        timer.start(`Remove product by id ${id}`)
        item = await ProductModel.findByIdAndDelete(id)
        timer.stop('Complete deleting product')

        if(item && item.images.length > 0) {
          timer.start('Remove product imgs')
          await removeImages(item.images)
          timer.stop('Complete deleting product img')
        }

        timer.start('Remove product id from section')
        if(item?.sectionID) await SectionModel.updateOne({ _id: item.sectionID }, { $pull: { productsID: String(item._id) } })
        timer.stop('Complete removing product id from sections')

        Loger.log('Remove some cache')
        cache.remove(cache.keys.PRODUCT_ID + item._id)
        cache.remove(cache.keys.HOME_DATA)
        cache.remove(cache.keys.ADMIN_STORE_DATA)
      break;
      case 'section':
        timer.start(`Remove section by id ${id}`)
        item = await SectionModel.findByIdAndDelete(id)
        timer.stop(`Complete removing section by id ${id}`)

        timer.start('Update products data')
        await ProductModel.updateMany({ _id: { $in: item.productsID } }, { precent: null, sectionID: null, category: null })
        timer.stop('Complete updating products')

        timer.start('Remove cache')
        for(let index = 0; index < item.productsID.length; index++) {
          Loger.log(`Removed cache ${item.productsID[index]}`)
          cache.remove(cache.keys.PRODUCT_ID + item.productsID[index])
        }
        timer.stop('Complete removing cache')
      break;
      case 'order':
        let productsID = []

        timer.start(`Remove item by ${id}`)
        item = await OrderModel.findByIdAndDelete(id)
        timer.stop('Complete removing order')

        timer.start('Get products id by ids')
        productsID = await ProductModel.find({ _id: { $in: item.toBuy.map(product => product._id) } })
        timer.stop('Complete getting products from order')

        timer.start('Remove products and cache')
        for(let index = 0; index < productsID.length; index++) {
          const product = await ProductModel.findById(productsID[index])

          if(product.stock <= 0) {
            await ProductModel.findByIdAndDelete(product._id)
            cache.remove(cache.keys.PRODUCT_ID + product._id)
          } else cache.set(cache.keys.PRODUCT_ID + product._id)
        }
        timer.stop('Complete deleting products where have stock equal to 0')
      break;
    }

    return { id }
  } catch(error) {
    throw new Error(error.message)
  }
}