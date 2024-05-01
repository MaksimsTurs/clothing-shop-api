import Loger from "../../util/loger/loger.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'

import { readFile } from "fs/promises"
import path from "path"

export default async function productPaginationFilter(req, res) {  
  try {
    const timer = new Loger.create.Timer()
    const { category, price, rating, page } = req.body
  
    timer.start(`Get maxProductsPerPage from ${path.join(process.cwd(), 'settings.json')}`)
    const MAX_CONTENT_PER_PAGE = parseInt(JSON.parse((await readFile(path.join(process.cwd(), 'settings.json'), { encoding: 'utf-8' })))['maxProductsPerPage'])
    timer.stop('Getting maxProductsPerPage completed')

    const isCategorySelected = category.length > 0
    const start = Number(page) * MAX_CONTENT_PER_PAGE
    const end = Number(start) + MAX_CONTENT_PER_PAGE
    
    let filteredProducts = [], categories = []
    let maxPages = 0, currPage = Number(page), maxProducts = 0
    let productsRange = { max: 0, min: 0 }

    timer.start('Filtering products')
    if(isCategorySelected) {
      filteredProducts = await ProductModel.find({ 
        $and: [{ $and: [{ stock: { $gte: 1 }}] }, { $or: [{ price: { $lte: (price === 0) ? 10000 : price }, rating: { $lte: (rating === 0) ? 5 : rating }, category: { $in: category }}] }]
      })
    } else {
      filteredProducts = await ProductModel.find({ 
        $and: [{ stock: { $gte: 1 }}, { $or: [{ price: { $lte: (price === 0) ? 10000 : price }, rating: { $lte: (rating === 0) ? 5 : rating }}] }]
      })
    }
    timer.stop('Complete filtering products')

    Loger.log('Slicing products array')
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