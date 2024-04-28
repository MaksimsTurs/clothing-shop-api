import Loger from "../../util/loger/loger.js"

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'

export default async function addProduct(req) {
  const timer = new Loger.create.Timer()
  const { body, files } = req

  const { title, price, stock, description, category, rating } = body

  let newProduct, updatedSection, response
  let imgs = []

  try {
    timer.start('CONVERT_AND_SAVE_IMG')
    if(files.length > 0) imgs = await convertAndSave(files, 70)
    timer.stop('Complete converting and saving imgs', 'CONVERT_AND_SAVE_IMG')

    timer.start('CREATE_PRODUCT')
    newProduct = new ProductModel({ _id: new mongoose.Types.ObjectId(), images: imgs, title, description, price, stock, rating })
    timer.stop('Complete creating product', 'CREATE_PRODUCT')

    // Will be called when ADMIN have selected the section, push new Product ID in existed section.
    if(!isUndefinedOrNull(category)) {
      timer.start('UPDATING_PRODUCTS_AND_SECTION')
      updatedSection = await SectionModel.findOneAndUpdate({ title: category }, { $push: { productsID: newProduct._id } }, { new: true })
      newProduct.sectionID = updatedSection._id
      newProduct.precent = updatedSection.precent
      newProduct.category = updatedSection.title
      timer.stop('Complete updating products and sections', 'UPDATING_PRODUCTS_AND_SECTION')
    }		
    
    await newProduct.save()

    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.set(cache.keys.PRODUCT_ID + newProduct._id)

    response = { newProduct, updatedSection }

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}