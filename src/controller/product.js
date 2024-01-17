import ProductModel from '../model/productModel.js'
import SectionModel from '../model/productSectionModel.js'

import loger from '../util/loger.js'

const product = {
  getAllProducts: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)
    
    let products = []
    let productsSections = []

    try {
      products = await ProductModel.find()
      productsSections = await SectionModel.find()
      
      if(productsSections.length > 0) {
        return res.status(200).send({ productsSections: productsSections })
      } else {
        return res.status(200).send({ productsSections: [{ _id: 0, items: products }] })
      }

    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ errorMessage: process.env.SERVER_500_RESPONSE_MESSAGE })
    }
  },
  getProductByID: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { id } = req.params

    let product = {}

    try {
      product = await ProductModel.findById(id)
      if(!product) return res.status(404).send({ errorMessage: process.env.SERVER_404_RESPONSE_MESSAGE })
      return res.status(200).send({ ...product._doc })
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ errorMessage: process.env.SERVER_500_RESPONSE_MESSAGE })
    }
  },
  productPaginationFilter: async (req, res) => {
    loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

    const { dressType, price } = req.body
    const { page } = req.params

    const start = Number(page) * Number(process.env.MAX_CONTENT_PER_PAGE)
    const end = Number(start) + Number(process.env.MAX_CONTENT_PER_PAGE)

    let filteredProducts = []
    let pagesCount = 0

    try {
      if(price > 0) {
        filteredProducts = await ProductModel.find().where('cost').lte(price)   
      } else {
        filteredProducts = await ProductModel.find()
      }

      pagesCount = Math.floor(filteredProducts.length / Number(process.env.MAX_CONTENT_PER_PAGE))
      filteredProducts = filteredProducts.slice(start, end)

      return res.status(200).send({ currentPageProducts: filteredProducts, pagesCount })
    } catch(error) {
      loger.logCatchError(error, import.meta.url)
      return res.status(500).send({ message: 'SERVER_ERROR' })
    }
  }
}

export default product