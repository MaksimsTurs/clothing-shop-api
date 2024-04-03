import ProductModel from '../model/productModel.js'
import SectionModel from '../model/productSectionModel.js'

import loger from '../util/loger.js'

import { RESPONSE_403, RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'
import { MAX_CONTENT_PER_PAGE } from '../constants/num-constans.js'

import { isValidObjectId } from 'mongoose'

const product = {
  getProductByID: async (req, res) => {
    const { originalUrl, body, params } = req
    loger.request(originalUrl, body, params)

    let product = {}
    
    try {
      if(!isValidObjectId(params.id)) return res.status(404).send(RESPONSE_403("Data is not valid!"))
      product = await ProductModel.findById(params.id)
      if(!product) return res.status(404).send(RESPONSE_404("Product not found!"))
    
      res.status(200).send({...product._doc})
      loger.response({...product._doc})
    } catch(error) {
      loger.error(error, '/controller/product.js', 'Get single product by ID.')
      res.status(500).send(RESPONSE_500())
    }
  },
  productPaginationFilter: async (req, res) => {
    const { originalUrl, body, params } = req
    loger.request(originalUrl, body, params)

    const { category, price, rating, page, title } = body

    const isCategorySelected = category.length > 0 ? true : false
    const start = Number(page) * MAX_CONTENT_PER_PAGE
    const end = Number(start) + MAX_CONTENT_PER_PAGE
    
    let filteredProducts = [], categories = [], productsID = []
    let maxPages = 0, currPage = Number(page), maxProducts = 0
    let productsRange = { max: 0, min: 0 }
    
    try {
      if(title) {
        productsID = (await SectionModel.findOne({ title })).productsID
        filteredProducts = await ProductModel
          .find({ _id: { $in: productsID }, categories: isCategorySelected ? { $in: category } : undefined })
          .where('price').lte(price === 0 ? 5000 : price)
          .where('rating').lte(rating === 0 ? 5000 : rating)        
      } else {
        filteredProducts = await ProductModel
          .find(isCategorySelected ? { category: { $in: category } } : {})
          .where('price').lte(price === 0 ? 5000 : price)
          .where('rating').lte(rating === 0 ? 5000 : rating)
      }
      
      maxPages = Math.round(filteredProducts.length / MAX_CONTENT_PER_PAGE)
      filteredProducts = filteredProducts.slice(start, end)
      maxProducts = (await ProductModel.find()).length  
      categories = (await SectionModel.find()).map(section => section.title)
      productsRange = { max: end > maxProducts ? maxProducts : end, min: start }
      
      const response = { productsRange, currPageProducts: filteredProducts, maxPages, currPage, categories, maxProducts }
      
      res.status(200).send(response)
      loger.response(response)
    } catch(error) {
      loger.error(error, 'Handle filter and pagination.')
      return res.status(500).send(RESPONSE_500())
    }
  },
}

export default product