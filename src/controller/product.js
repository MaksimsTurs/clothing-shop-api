import ProductModel from '../model/productModel.js'
import SectionModel from '../model/productSectionModel.js'

import loger from '../util/loger.js'
import { invalidateCacheKey } from '../util/cache.js'

import { RESPONSE_403, RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'
import { MAX_CONTENT_PER_PAGE } from '../constants/num-constans.js'

import findMany from '../data-utils/findMany.js'
import findOne from '../data-utils/findOne.js'

import { isValidObjectId } from 'mongoose'

const product = {
  getAllProducts: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    let products = [], sections = [], response = []
    
    try {
      products = await findMany({ model: ProductModel, cacheKey: 'products' })
      sections = await findMany({ model: SectionModel, cacheKey: 'products-section' })

      if(sections.length > 0) {
        loger.logResponse({ sections: response })
        return res.status(200).send({ sections: response })
      }

      // Push products Object in their Section. 
      for(let index = 0; index < sections.length; index++) {
        response = [...response, {...sections[index]._doc, products: []}] 
        response[index].products = await ProductModel.find({ sectionID: sections[index]._id })
      }
        
      loger.logResponse({ sections: [{ _id: 0, products: products }] })
      return res.status(200).send({ sections: [{ _id: 0, products: products }] })
    } catch(error) {
      loger.logError(error, import.meta.url, '23 - 38')
      return res.status(500).send(RESPONSE_500())
    }
  },
  getProductByTitle: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { title } = params

    let products = []

    try {
      products = await ProductModel.find({ title: { $regex: title } })

      loger.logResponse({ products })
      return res.status(200).send({ products })
    } catch(error) {
      loger.logError(error, import.meta.url, '53 - 56')
      return res.status(500).send(RESPONSE_500())
    }
  },
  getProductByID: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { id } = params

    let product = {}

    try {
      if(!isValidObjectId(id)) return res.status(404).send(RESPONSE_403("Product id is not Valid!"))
      product = await findOne({ model: ProductModel, cacheKey: `product-${id}`, condition: { _id: id } })
      if(!product) return res.status(404).send(RESPONSE_404("Product not founded!"))

      loger.logResponse({...product._doc})
      return res.status(200).send({...product._doc})
    } catch(error) {
      loger.logError(error, import.meta.url, '53 - 58')
      return res.status(500).send(RESPONSE_500())
    }
  },
  productPaginationFilter: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const { category, price, rating, page } = body

    const isCategorySelected = category.length > 0 ? true : false
    const start = Number(page) * MAX_CONTENT_PER_PAGE
    const end = Number(start) + MAX_CONTENT_PER_PAGE

    let filteredProducts = []
    let maxPages = 0, productsLength = 0, currPage = Number(page)
    let productsRange = { max: 0, min: 0 }

    try {
      filteredProducts = await ProductModel
        .find(isCategorySelected ? { categories: { $in: category } } : {})
        .where('price').lte(price === 0 ? 5000 : price)
        .where('rating').lte(rating === 0 ? 5000 : rating)

      maxPages = Math.round(filteredProducts.length / MAX_CONTENT_PER_PAGE)
      filteredProducts = filteredProducts.slice(start, end)
      productsLength = (await findMany({ model: ProductModel, cacheKey: 'products-length' })).length
      productsRange = { max: end, min: start }

      loger.logResponse({ productsRange, productsLength, currPageProducts: filteredProducts, maxPages, currPage })
      return res.status(200).send({ productsRange, productsLength, currPageProducts: filteredProducts, maxPages, currPage })
    } catch(error) {
      loger.logError(error, import.meta.url, '79 - 90')
      return res.status(500).send(RESPONSE_500())
    }
  },
  removeProductSection: async (req, res) => {
    const { protocol, hostname, originalUrl, body, params } = req
    loger.logRequest(protocol, hostname, originalUrl, body, params)

    const title = params.title.replace('%20', ' ')

    let products = []

    try {
      await SectionModel.findOneAndDelete({ title })
      products = await findMany({ model: ProductModel, cacheKey: 'products' })

      for(let index = 0; index < products.length; index++) {
        await ProductModel.findByIdAndUpdate(products[index]._id, { precent: null, sectionID: null })
        // invalidateCacheKey(`product-${products[index]._id}`)
      }

      // invalidateCacheKey('products')
      // invalidateCacheKey('products-section')

      loger.logResponse({ code: 200, message: 'Succes' })
      return res.status(200).send({ code: 200, message: 'Succes' })
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '100 - 111')
      return res.status(500).send(RESPONSE_500())
    }
  }
}

export default product