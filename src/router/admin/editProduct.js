import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from "../../util/isUndefinedOrNull.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import { cache } from "../../../index.js"

export default async function editProduct(req) {
  try {
    const timer = new Loger.create.Timer()
    const { files } = req
    const commonProjection = { __v: false }
  
    let { category, _id, precent, title, price, rating, description, stock } = req.body 
  
    let updatedProduct, updatedCategory, response
    let imgs = []

    timer.start(`Convert and save product imgs, quality ${70}`)
    if(files.length > 0) imgs = await convertAndSave(files, 70)
    timer.stop('Complete')

    timer.start(`Get products by id "${_id}"`)
    updatedProduct = await ProductModel.findById({ _id })
    timer.stop(`Complete`)

    //When section was selected, push the new ID and update product.
    if(!isUndefinedOrNull(category) && updatedProduct.stock > 0) {
      updatedCategory = await SectionModel.findOne({ title: category }, commonProjection)
      //Push product id when not include.
      if(!updatedCategory.productsID.includes(_id)) {
        timer.start('Push into section new product id')
        updatedCategory.productsID = [...updatedCategory.productsID, _id]
        await updatedCategory.save()
        timer.stop('Complete')
      }
    }

    timer.start('Updating product and return new Document')
    updatedProduct = await ProductModel.findByIdAndUpdate(_id, {
      title,
      price,
      rating,
      stock,
      description, 
      precent: isUndefinedOrNull(precent) ? updatedCategory?.precent : precent,
      sectionID: !isUndefinedOrNull(updatedProduct?.sectionID) ? updatedProduct.sectionID : updatedCategory?._id || null,
      category: !isUndefinedOrNull(updatedProduct?.category) ? updatedProduct.category : updatedCategory?.title || null,
      images: imgs.length > 0 ? imgs[0] : updatedProduct.images,
    }, { new: true, projection: commonProjection })
    timer.stop('Complete')

    Loger.log('Remove some cache')
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)
    cache.set(cache.keys.PRODUCT_ID + _id, updatedProduct._doc)

    Loger.log('Assign data to response')
    response = { updatedProduct, updatedCategory }

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}