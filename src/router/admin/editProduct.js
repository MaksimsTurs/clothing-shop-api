import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from "../../util/isUndefinedOrNull.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'

import { cache } from "../../../index.js"

export default async function editProduct(req) {
  const timer = new Loger.create.Timer()
  const { files } = req

  let { category, _id, precent, title, price, rating, description, stock } = req.body 

  let updatedProduct, updatedCategory, response
  let imgs = []

  const commonProjection = { __v: false }

  try {
    timer.start('CONVERT_AND_SAVE')
    if(files.length > 0) imgs = await convertAndSave(files, 70)
    timer.stop('Complete converting img', 'CONVERT_AND_SAVE')

    timer.start('GETTING_PRODUCT')
    updatedProduct = await ProductModel.findById({ _id })
    timer.stop('Complete updating product', 'GETTING_PRODUCT')

    //When section was selected, push the new ID and update product.
    if(!isUndefinedOrNull(category) && updatedProduct.stock > 0) {
      updatedCategory = await SectionModel.findOne({ title: category }, commonProjection)
      //Push product id when not include.
      if(!updatedCategory.productsID.includes(_id)) {
        timer.start('PUSH_ID_INTO_SECTION')
        updatedCategory.productsID = [...updatedCategory.productsID, _id]
        await updatedCategory.save()
        timer.stop('Complete push id into category and save', 'PUSH_ID_INTO_SECTION')
      }
    }

    Loger.text('Updating product and return new Document...')
    timer.start('UPDATING_PRODUCT')
    updatedProduct = await ProductModel.findByIdAndUpdate(_id, {
      title,
      price,
      rating,
      stock,
      description, 
      precent: isUndefinedOrNull(precent) ? updatedCategory?.precent : precent,
      sectionID: !isUndefinedOrNull(updatedProduct?.sectionID) ? updatedProduct.sectionID : updatedCategory._id || null,
      category: !isUndefinedOrNull(updatedProduct?.category) ? updatedProduct.category : updatedCategory.title || null,
      images: imgs.length > 0 ? imgs[0] : updatedProduct.images,
    }, { new: true, projection: commonProjection })
    timer.stop('Complete updating product', 'UPDATING_PRODUCT')

    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.remove(cache.keys.HOME_DATA)
    cache.set(cache.keys.PRODUCT_ID + _id, updatedProduct._doc)

    response = { updatedProduct, updatedCategory }

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}