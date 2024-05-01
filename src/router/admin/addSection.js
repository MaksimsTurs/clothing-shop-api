import Loger from "../../util/loger/loger.js"

import SectionModel from '../../model/productSectionModel.js'
import ProductModel from '../../model/productModel.js'

import { cache } from "../../../index.js"

import mongoose from "mongoose"

export default async function addSection(req) {
  try {
    const timer = new Loger.create.Timer()
    const { productsID, precent, title, expiredDate, isHidden, position } = req.body
  
    let newSection

    timer.start('Create new section')
    newSection = await SectionModel.create({ _id: new mongoose.Types.ObjectId(), title, precent, productsID, expiredDate,  isHidden, position })
    timer.stop('Complete creating new section')

    if(productsID.length > 0) {
      timer.start('Update products')
      await ProductModel.updateMany({ _id: { $in: productsID } }, { precent, sectionID: newSection._id, category: newSection.title })
      timer.stop('Complete updating products')

      timer.start('Remove cache')
      for(let index = 0; index < productsID.lenght; index++) {
        Loger.log(`Removed product cache id: ${productsID[index]}`)
        cache.remove(cache.keys.PRODUCT_ID + productsID[index])
      }
      timer.stop('Complete removing cache')
    }

    Loger.log('Remove some other cache')
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)

    return newSection
  } catch(error) {
    throw new Error(error.message)
  }
}