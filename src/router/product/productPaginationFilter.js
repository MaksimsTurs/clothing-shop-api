import Loger from "../../util/loger/loger.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'
import WebsiteSettingsModel from '../../model/websiteSetting.js'

export default async function productPaginationFilter(req) {  
  try {
    const timer = new Loger.create.Timer()
    let { category, price, rating, page } = req.body
    const MAX_CONTENT_PER_PAGE = (await WebsiteSettingsModel.find())[0].maxProductsPerPage
  
    const isCategorySelected = category.length > 0
    const start = Number(page) * MAX_CONTENT_PER_PAGE
    const end = Number(start) + MAX_CONTENT_PER_PAGE
    
    let filteredProducts = [], categories = []
    let maxPages = 0, currPage = Number(page), maxProducts = 0
    let productsRange = { max: 0, min: 0 }

    price = price === 0 ? 1000 : price
    rating = rating === 0 ? 1000 : rating

    //stock 1
    //rating 0 (100)
    //price 0 (100)

    timer.start('Filtering products')
    if(isCategorySelected) filteredProducts = await ProductModel.find({ $and: [{ stock: { $gte: 1 }}, { $or: [{ price: { $lte: price }, rating: { $lte: rating }, category: { $in: category }}] }] })
    else filteredProducts = await ProductModel.find({ $and: [{ stock: { $gte: 1 }}, { $or: [{ price: { $lte: price }, rating: { $lte: rating }}] }] })
    timer.stop('Complete filtering products')

    Loger.log(`Slicing products for page, start = ${start} | end = ${end}`)
    filteredProducts = filteredProducts.slice(start, end)

    Loger.log('Calculate pages count')
    maxPages = Math.ceil(filteredProducts.length / MAX_CONTENT_PER_PAGE)
    
    Loger.log('Get filtered products count')
    maxProducts = filteredProducts.length
    
    timer.start('Getting sections titles')
    categories = (await SectionModel.find({}, { title: true, _id: false })).map(category => category.title)
    timer.stop('Complete getting sections title')


    Loger.log('Assign max and min values')
    productsRange = { max: end, min: filteredProducts.length }
        
    return { productsRange, currPageProducts: filteredProducts, maxPages, currPage, categories, maxProducts }
  } catch(error) {
    throw new Error(error.message)
  }
}