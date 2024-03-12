import loger from '../util/loger.js'
import isAuthorizated from '../util/isAuthorizated.js'
import isUndefinedOrNull from '../util/isUndefinedOrNull.js'
import { invalidateCacheKey } from '../util/cache.js'

import ProductModel from '../model/productModel.js'
import UserModel from '../model/userModel.js'
import SectionModel from '../model/productSectionModel.js'

import mongoose from 'mongoose'

import { RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'

import findMany from '../data-utils/findMany.js'
import findOne from '../data-utils/findOne.js'
import saveImages from '../data-utils/saveImages.js'

const admin = {
	controllUser: async (req, res) => {
		const { protocol, hostname, originalUrl, body, params } = req
		loger.logRequest(protocol, hostname, originalUrl, body, params)

		const { code, message } = await isAuthorizated(params.token, true)

		loger.logResponse({ code, message })
		return res.status(code).send({ code, message })
	},
	getStoreData: async (req, res) => {
		const { protocol, hostname, originalUrl, body, params } = req
		loger.logRequest(protocol, hostname, originalUrl, body, params)

		let products = [], productsSection = [], users = []

		try {
			products = await findMany({ model: ProductModel, cacheKey: 'products' })
			productsSection = await findMany({ model: SectionModel, cacheKey: 'products-section' })
			users = await findMany({ model: UserModel, cacheKey: 'users' })

			users = users.map(user => {
				const { __v, token, password, ...userData } = user._doc
				return userData
			})

			loger.logResponse({ products, productsSection, users })
			return res.status(200).send({ products, productsSection, users })
		} catch(error) {
			loger.logError(error, import.meta.url, '35 - 45')
			return res.status(500).send(RESPONSE_500())
		}
	},
	addProduct: async (req, res) => {
		const { protocol, hostname, originalUrl, body, files, params } = req
		loger.logRequest(protocol, hostname, originalUrl, body, params)

		const { title, price, inStock, description, selectedSection, token } = body
		const sectionData = isUndefinedOrNull(selectedSection) ? undefined : JSON.parse(selectedSection) // { _id: string, title: string }
		const productIMGs = files // Array of files

		let newProduct = {}, newSection = {}

		//Create new Product.
		try {
			newProduct = new ProductModel({ 
				_id: new mongoose.Types.ObjectId(),
				title,
				description,
				rating: 0,
				price: isUndefinedOrNull(price) ? 0 : price,
				stock: isUndefinedOrNull(inStock) ? 0 : inStock,
				images: await saveImages(productIMGs)
			})
		} catch(error) {
			loger.logError(error, import.meta.url, '63 - 71')
			return res.status(500).send(RESPONSE_500())
		}

		//Will be called when ADMIN have selected the section.
		//Push new Product ID in existed section.
		try {
			if(sectionData) {
				newSection = await SectionModel.findByIdAndUpdate(sectionData._id, { $push: { productID: newProduct._id } }, { new: true })
				newProduct.sectionID = newSection._id
				newProduct.precent = newSection.precent
	
				invalidateCacheKey('products-section')
			}		
			
			await newProduct.save()
			invalidateCacheKey('products')

			loger.logResponse({ newProduct, newSection })
			return res.status(200).send({ newProduct, newSection })	
		} catch(error) {
			loger.logError(error, import.meta.url, '80 - 92')
			return res.status(500).send(RESPONSE_500())
		}
	},
	editProduct: async (req, res) => {
		const { protocol, hostname, originalUrl, body, files, params } = req
		loger.logRequest(protocol, hostname, originalUrl, body, params)

		const { selectedSection, title, price, inStock, description, productID } = req.body 
		const sectionData = isUndefinedOrNull(selectedSection) ? undefined : JSON.parse(selectedSection) // { _id: string, title: string }
		const productIMGs = files // Array of files

		let newProduct = {}, newSection = {}
		
		try {
			if(sectionData) newSection = await findOne({ model: SectionModel, cacheKey: undefined, condition: { _id: sectionData._id } })
			newProduct = await findOne({ model: ProductModel, cacheKey: `product-${productID}`, condition: { _id: productID } })

			newProduct = await ProductModel.findByIdAndUpdate(productID, {
				title: isUndefinedOrNull(title) ? newProduct.title : title,
				description: isUndefinedOrNull(description) ? newProduct.description : description,
				price: isUndefinedOrNull(price) ? newProduct.price : price,
				stock: isUndefinedOrNull(inStock) ? newProduct.stock : inStock,
				precent: isUndefinedOrNull(newSection.precent) ? null : newSection.precent,
				sectionID: isUndefinedOrNull(sectionData._id) ? null : sectionData._id,
				images: await saveImages(productIMGs)
			}, { new: true })
			newSection = await SectionModel.findByIdAndUpdate(sectionData._id, {
				productID: [...newSection.productID.filter(id => String(id) !== String(newProduct._id)), newProduct._id]
			}, { new: true })

			invalidateCacheKey('products')
			invalidateCacheKey(`product-${productID}`)
			invalidateCacheKey('products-section')

			loger.logResponse({ newProduct, newSection })
			return res.status(200).send({ newProduct, newSection })
		} catch(error) {
			loger.logError(error, import.meta.url, '109 - 130')
			return res.status(500).send(RESPONSE_500())
		}
	},
	addSection: async (req, res) => {
		const { protocol, hostname, originalUrl, body, params } = req
		loger.logRequest(protocol, hostname, originalUrl, body, params)

		const { items, precent, title, expiredDate } = body

		let product = {}, productSection = {}

		try {
			productSection = new SectionModel({ _id: new mongoose.Types.ObjectId(), title, precent, productID: items, expiredDate })

			//Update products.
			//Find product for add to Products Section.
			for(let index = 0; index < items.length; index++) {
				product = await ProductModel.findByIdAndUpdate(items[index], { precent, sectionID: productSection._id }, { new: true })
				invalidateCacheKey(`product-${items[index]}`)
			}
			
			await productSection.save()

			invalidateCacheKey('products')
			invalidateCacheKey('products-section')

			loger.logResponse({ section: productSection })
			return res.status(200).send({ section: productSection })
		} catch(error) {
			loger.logError(error, import.meta.url, '145 - 160')
			return res.status(500).send(RESPONSE_500())
		}
	},
	editProductsSection: async (req, res) => {
		const { protocol, hostname, originalUrl, body, params } = req
		loger.logRequest(protocol, hostname, originalUrl, body, params)

		const { items, title, precent, expiredDate, id, currentProductsID } = body

		let product = {}, productsSection = {}
		let products = [], productsID = [...items, ...currentProductsID]

		try {
			productsSection = await SectionModel.findByIdAndUpdate(id, {
				title: title || productsSection.title,
				precent: precent || productsSection.precent || null,
				expiredDate: expiredDate || productsSection.expiredDate || null
			}, { new: true })

			if(!productsSection) return res.status(404).send(RESPONSE_404())
			
			//Update their Products.
			if(productsID.length > 0) {
				for(let index = 0; index < productsID.length; index++) {
					product = await ProductModel.findByIdAndUpdate(productsID[index], { precent: precent || productsSection.precent || null, sectionID: productsSection._id }, { new: true })

					if(!productsSection.productID.include(productsID[index])) productsSection.productID.push(productsID[index])

					products.push(product)

					invalidateCacheKey(`product-${productsID[index]}`)
				}
			}

			await productsSection.save()

			invalidateCacheKey('products')
			invalidateCacheKey('products-section')
			
			loger.logResponse({ newSection: productsSection, newProducts: products })
			return res.status(200).send({ newSection: productsSection, newProducts: products })	
		} catch(error) {
			loger.logError(error, import.meta.url, '176 - 203')
			return res.status(500).send(RESPONSE_500())	
		}
	}
}

export default admin