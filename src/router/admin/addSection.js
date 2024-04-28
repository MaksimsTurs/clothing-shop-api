import Loger from "../../util/loger/loger.js"

import SectionModel from '../../model/productSectionModel.js'
import ProductModel from '../../model/productModel.js'

import { cache } from "../../../index.js"

import mongoose from "mongoose"

export default async function addSection(req) {
  const timer = new Loger.create.Timer()
  const { productsID, precent, title, expiredDate } = req.body

  let newSection
  
  try {
    timer.start('CREATE_SECTION')
    newSection = await SectionModel.create({ _id: new mongoose.Types.ObjectId(), title, precent, productsID, expiredDate })
    timer.stop('Complete creating new section', 'CREATE_SECTION')

    if(productsID.length > 0) {
      timer.start('UPDATE_PRODUCTS')
      await ProductModel.updateMany({ _id: { $in: productsID } }, { precent, sectionID: newSection._id, category: newSection.title })
      timer.stop('Complete updating products', 'UPDATE_PRODUCTS')

      timer.start('REMOVE_CACHE')
      for(let index = 0; index < productsID.lenght; index++) cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      timer.stop('Complete removing cache', 'REMOVE_CACHE')
    }

    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)

    return newSection
  } catch(error) {
    throw new Error(error.message)
  }
}