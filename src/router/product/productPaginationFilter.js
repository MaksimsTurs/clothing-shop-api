import Loger from "../../util/loger/loger.js"

import ProductModel from '../../model/productModel.js'
import SectionModel from '../../model/productSectionModel.js'

export default async function productPaginationFilter(req, res) {
  const timer = new Loger.create.Timer()
  const { category, price, rating, page } = req.body

  const isCategorySelected = category.length > 0
  const start = Number(page) * 15
  const end = Number(start) + 15
  
  let filteredProducts = [], categories = []
  let maxPages = 0, currPage = Number(page), maxProducts = 0
  let productsRange = { max: 0, min: 0 }, response
    
  try {

    timer.start('FILTERING_PRODUCTS')
    if(isCategorySelected) {
      filteredProducts = await ProductModel.find({ 
        $and: [{ $and: [{ stock: { $gte: 1 }}] }, { $or: [{ price: { $lte: (price === 0) ? 10000 : price }, rating: { $lte: (rating === 0) ? 5 : rating }, category: { $in: category }}] }]
      })
    } else {
      filteredProducts = await ProductModel.find({ 
        $and: [{ stock: { $gte: 1 }}, { $or: [{ price: { $lte: (price === 0) ? 10000 : price }, rating: { $lte: (rating === 0) ? 5 : rating }}] }]
      })
    }
    timer.stop('Complete filtering products', 'FILTERING_PRODUCTS')

    Loger.text('Slicing products array')
    filteredProducts = filteredProducts.slice(start, end)

    Loger.text('Calculate pages count')
    maxPages = Math.ceil(filteredProducts.length / 15)
    
    timer.start('GETTING_PRODUCTS_COUNT')
    maxProducts = filteredProducts.length
    timer.stop('Complete getting products count', 'GETTING_PRODUCTS_COUNT')
    
    timer.start('GETTING_SECTION_TITLE')
    categories = (await SectionModel.find()).map(section => section.title)
    timer.stop('Complete getting sections title', 'GETTING_SECTION_TITLE')

    productsRange = { max: end, min: start }
    
    response = { productsRange, currPageProducts: filteredProducts, maxPages, currPage, categories, maxProducts }
    
    return response
  } catch(error) {
    throw new Error(error.message)
  }
}