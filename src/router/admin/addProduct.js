import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from '../../util/isUndefinedOrNull.js'

import convertAndSave from "../../util/data-utils/convertAndSave.js"

import mongoose from "mongoose"

import { cache } from '../../../index.js'

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'

export default async function addProduct(req) {  
  try {
    const timer = new Loger.create.Timer()
    const { body, files } = req
  
    const { title, price, stock, description, category, rating } = body
  
    let newProduct, updatedSection, response
    let imgs = []

    timer.start(`Conver and save product imgs, quality ${70}`)
    if(files.length > 0) imgs = await convertAndSave(files, 70)
    timer.stop('Complete')

    timer.start('Create product')
    newProduct = new ProductModel({ _id: new mongoose.Types.ObjectId(), images: imgs, title, description, price, stock, rating })
    timer.stop('Complete')

    // Will be called when ADMIN have selected the section, push new Product ID in existed section.
    if(!isUndefinedOrNull(category)) {
      timer.start('Update products and sections')
      updatedSection = await SectionModel.findOneAndUpdate({ title: category }, { $push: { productsID: newProduct._id } }, { new: true })
      newProduct.sectionID = updatedSection._id
      newProduct.precent = updatedSection.precent
      newProduct.category = updatedSection.title
      timer.stop('Complete')
    }		
    
    timer.start('Save product and update cache')
    await newProduct.save()
    cache.remove(cache.keys.ADMIN_STORE_DATA)
    cache.set(cache.keys.PRODUCT_ID + newProduct._id)
    cache.remove(cache.keys.HOMDE_DATA)
    timer.stop('Complete')

    Loger.log('Assign data to response')
    response = { newProduct, updatedSection }

    return response
  } catch(error) {
    throw new Error(error.message)
  }
}