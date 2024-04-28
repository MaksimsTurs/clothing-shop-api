import Loger from "../../util/loger/loger.js"

import SectionModel from '../../model/productSectionModel.js'
import ProductModel from '../../model/productModel.js'

import { cache } from '../../../index.js'

export default async function editSection(req) {
  const timer = new Loger.create.Timer()
  const { title, isHidden, position, precent, expiredDate, id, productsID } = req.body

  const sectionProjection = { __v: false }

  let productsSection
  
  try {
    timer.start('GETTING_PRODUCT')
    productsSection = await SectionModel.findById(id, sectionProjection)
    timer.stop('Complete getting and updating product section', 'GETTING_PRODUCT')

    productsSection.title = title
    productsSection.precent = precent
    productsSection.position = position
    productsSection.isHidden = isHidden
    productsSection.expiredDate = expiredDate
    
    timer.start('UPDATING_PRODUCT_IN_SECTION')
    if(productsID.length > 0) {
      for(let index = 0; index < productsID.length; index++) {
        await ProductModel.findOneAndUpdate({ $and: [{ _id: productsID[index] }, { stock: { $gte: 1 } }] }, { precent: productsSection.precent, category: productsSection.title, sectionID: productsSection._id }) 
        if(!productsSection.productsID.includes(productsID[index])) productsSection.productsID.push(productsID[index])
      }
    }
    timer.stop('Complete updating products in section', 'UPDATING_PRODUCT_IN_SECTION')

    await productsSection.save()

    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)

    return productsSection._doc
  } catch(error) {
    throw new Error(error.message)
  }
}