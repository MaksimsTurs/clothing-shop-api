import Loger from "../../util/loger/loger.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import WebsiteSettingsModel from '../../model/websiteSetting.js'

export default async function productPaginationFilter(req) {  
  try {
    const timer = new Loger.create.Timer()
    let { category, price, rating, page } = req.body

    timer.start('Getting max products per page property')
    const { maxProductsPerPage } = await WebsiteSettingsModel.findOne({ key: 'websitesettings' }, { maxProductsPerPage: true })
    timer.start('Complete')
  
    const isCategorySelected = category.length > 0
    const start = Number(page) * maxProductsPerPage
    const end = Number(start) + maxProductsPerPage
    
    let filteredProducts = [], categories = []
    let maxPages = 0, currPage = Number(page), maxProducts = 0
    let productsRange = { max: 0, min: 0 }

    price = price === 0 ? 1000 : price
    rating = rating === 0 ? 1000 : rating

    timer.start('Filtering products')
    if(isCategorySelected) {
      filteredProducts = await ProductModel.find({ 
        $and: [
          { stock: { $gte: 1 }}, 
          { $and: [
            { price: { $lte: price }}, 
            { rating: { $lte: rating }}, 
            { category: { $in: category }}] 
          }
        ] 
      })
    } else {
      filteredProducts = await ProductModel.find({ 
        $and: [
          { stock: { $gte: 1 }}, 
          { $and: [{ price: { $lte: price } }, { rating: { $lte: rating } }] }
        ] 
      })
    }
    timer.stop('Complete')

    Loger.log('Calculate pages count')
    maxPages = Math.ceil(filteredProducts.length / maxProductsPerPage)

    Loger.log(`Slicing products for page, start = ${start} | end = ${end}`)
    filteredProducts = filteredProducts.slice(start, end)
    
    Loger.log('Get filtered products count')
    maxProducts = filteredProducts.length
    
    timer.start('Getting sections titles')
    categories = (await SectionModel.find({}, { title: true, _id: false })).map(category => category.title)
    timer.stop('Complete')


    Loger.log('Assign max and min values')
    productsRange = { max: end, min: filteredProducts.length }
        
    return { productsRange, currPageProducts: filteredProducts, maxPages, currPage, categories, maxProducts }
  } catch(error) {
    throw new Error(error.message)
  }
}