import Loger from "../../util/loger/loger.js"
import { cache } from "../../../index.js"

import { readFile } from "fs/promises"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import UserModel from '../../model/userModel.js'
import path from "path"

export default async function getHomePageData() {
  const timer = new Loger.create.Timer()

  let usersNumber = 0
  let settings, products, sections
  let response = cache.get(cache.keys.HOME_DATA)

  const commonProjection = { __v: false, createdAt: false, updatedAt: false }
  const productProjection = { category: false, sectionID: false }
  
  if(response) {
    Loger.text('Cache HIT, send response to client')
    return response
  }

  try {
    Loger.text('Cache MISS, get data from database')
    timer.start('READ_SETTING')
    settings = JSON.parse(await readFile(path.join(process.cwd(), 'settings.json'), { encoding: 'utf-8' }))
    timer.stop('Complete reading website settings', 'READ_SETTING')    

    if(!settings.isAllProductsHidden) {
      timer.start('GETTING_PRODUCTS')
      products = await ProductModel.find({ stock: { $gte: 1 } }, {...commonProjection, ...productProjection })
      timer.stop('Complete getting products', 'GETTING_PRODUCTS')
    }
  
    timer.start('GETTING_SECTIONS')
    sections = await SectionModel.find({ isHidden: false }, {...commonProjection }, { populate: { path: 'productsID' } })
    timer.stop('Complete getting products section', 'GETTING_SECTIONS')
  
    timer.start('GETTING_USER_COUNT')
    usersNumber = await UserModel.countDocuments()
    timer.stop('Complete getting users count', 'GETTING_USER_COUNT')

    Loger.text('Assign data into response, cache and return him')
    response = { 
      products, 
      usersNumber,
      brandsNumber: 0,
      productsNumber: products?.length || 0,
      sections: sections.map(section => ({...section._doc, products: section.productsID }))
    }

    cache.set(cache.keys.HOME_DATA, response)
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}