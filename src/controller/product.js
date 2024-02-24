import ProductModel from '../model/productModel.js'
import SectionModel from '../model/productSectionModel.js'

import loger from '../util/loger.js'

import { RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'

const product = {
  getAllProducts: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)
    
    let products = [], productsSections = [], response = []

    try {
      products = await ProductModel.find()
      productsSections = await SectionModel.find()

      // Save products Object in their Section. 
      for(let index = 0; index < productsSections.length; index++) {
        response = [...response, {...productsSections[index]._doc, products: []}] 
        response[index].products = await ProductModel.find({ sectionID: productsSections[index]._id })
      }
      
      if(productsSections.length > 0) {
        loger.logResponseData({ productsSections: response })
        return res.status(200).send({ productsSections: response })
      }
        
      loger.logResponseData({ productsSections: [{ _id: 0, products: products }] })
      return res.status(200).send({ productsSections: [{ _id: 0, products: products }] })
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '13 - 27')
      return res.status(500).send(RESPONSE_500())
    }
  },
  getProductByID: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    let product = {}

    try {
      product = await ProductModel.findById(req.params.id)
      if(!product) return res.status(404).send(RESPONSE_404("Product with this ID not finded!"))
      loger.logResponseData({...product._doc})
      return res.status(200).send({...product._doc})
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send(RESPONSE_500())
    }
  },
  productPaginationFilter: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { category, price, rating, page } = req.body

    const isCategorySelected = category.length > 0 ? true : false
    const start = Number(page) * Number(process.env.MAX_CONTENT_PER_PAGE)
    const end = Number(start) + Number(process.env.MAX_CONTENT_PER_PAGE)

    let filteredProducts = []
    let maxPages = 0, productsLength = 0
    let productsRange = { max: 0, min: 0 }
    let currPage = Number(page)

    try {
      filteredProducts = await ProductModel
        .find(isCategorySelected ? { categories: { $in: category } } : {})
        // .where('price').lte(price === 0 ? 5000 : price)
        // .where('rating').lte(rating === 0 ? 5000 : rating)

        maxPages = Math.round(filteredProducts.length / Number(process.env.MAX_CONTENT_PER_PAGE))
      filteredProducts = filteredProducts.slice(start, end)
      productsLength = (await ProductModel.find({})).length
      productsRange = { max: end, min: start }

      loger.logResponseData({ productsRange, productsLength, currPageProducts: filteredProducts, maxPages, currPage })
      return res.status(200).send({ productsRange, productsLength, currPageProducts: filteredProducts, maxPages, currPage })
    } catch(error) {
      loger.logCatchError(error, import.meta.url, '87 - 96')
      return res.status(500).send(RESPONSE_500())
    }
  }
}

export default product