import loger from '../util/loger.js'
import userControllU from '../util/userControllU.js'
import isUndefinedOrNull from '../util/isUndefinedOrNull.js'

import ProductModel from '../model/productModel.js'
import UserModel from '../model/userModel.js'
import SectionModel from '../model/productSectionModel.js'

import { v2 as cloudinary } from 'cloudinary'
import mongoose from 'mongoose'

import { RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'

const admin = {
	controllUser: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { code, message } = await userControllU(req.params.token || req.body.token)

		loger.logResponseData({ code, message })
		return res.status(code).send({ code, message })
	},
	getStoreData: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		let products = [], productsSection = [], users = []

		try {
			products = await ProductModel.find()
			productsSection = await SectionModel.find()
			users = await UserModel.find()

			users = users.map(user => {
				const { __v, token, password, ...userData } = user._doc
				return userData
			})

			loger.logResponseData({ products, productsSection, users })
			return res.status(200).send({ products, productsSection, users })
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '28 - 38')
			return res.status(500).send(RESPONSE_500())
		}
	},
	addProduct: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { title, price, inStock, description, selectedSection, token } = req.body
		const sectionData = isUndefinedOrNull(selectedSection) ? undefined : JSON.parse(selectedSection)
		const productImgs = req.files

		let secureURL = ''
		let newProduct = {}, newSection = {}

		const { code, message } = await userControllU(token)

		if(code !== 200) res.status(code).send({ code, message })

		try {
			//Create new Product.
			newProduct = new ProductModel({ 
				_id: new mongoose.Types.ObjectId(),
				title,
				description,
				price: isUndefinedOrNull(price) ? 0 : price,
				rating: 0,
				stock: isUndefinedOrNull(inStock) ? 0 : inStock,
				sectionID: !isUndefinedOrNull(selectedSection) ? selectedSection : null,
			})
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '59 - 68')
			return res.status(500).send({ message: RESPONSE_500() })
		}

		try {
			//Save Product Images URL links.
			if(productImgs.length > 0) {
				for (let index = 0; index < productImgs.length; index++) {
					cloudinary.config({
						cloud_name: process.env.CLOUDINARY_NAME,
						api_key: process.env.CLOUDINARY_API_KEY,
						api_secret: process.env.CLOUDINARY_API_SECRET,
						secure: true,
					})

					secureURL = (await cloudinary.uploader.upload(productImgs[index].path)).secure_url
					newProduct.images = [...newProduct.images, secureURL]
				}
			}
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '55 - 79')
			return res.status(500).send({ message: RESPONSE_500 })
		}

		//Save ID in existed section.
		try {
			if(sectionData) {
				newSection = await SectionModel.findById(sectionData._id)
				if(!newSection)	return res.status(404).send({ message: RESPONSE_404 })
	
				newSection.productID = [...newSection.productID, newProduct._id]
				newProduct.sectionID = newSection._id
				newProduct.precent = newSection.precent

				await SectionModel.updateOne({ _id: newSection._id }, newSection)
			}			
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '55 - 79')
			return res.status(500).send({ message: RESPONSE_500 })
		}

		try {
			await newProduct.save()
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '55 - 79')
			return res.status(500).send({ message: RESPONSE_500 })
		}

		loger.logResponseData({ newProduct, newSection })
		return res.status(200).send({ newProduct, newSection })
	},
	editProduct: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { selectedSection, title, price, inStock, description, token, productID } = req.body 
		const sectionInfo = isUndefinedOrNull(selectedSection) ? undefined : JSON.parse(selectedSection)
		const productIMGs = req.files

		let secureURL = ''
		let newProduct = {}, newSection = {}

		const { code, message } = await userControllU(token)

		if(code !== 200) return res.status(code).send({ message })

		try {
			//Save base changes.
			newProduct = await ProductModel.findById(productID)
			if(!newProduct) return res.status(404).send({ message: RESPONSE_404 })

			newProduct._doc = {
				...newProduct._doc,
				title: isUndefinedOrNull(title) ? newProduct.title : title,
				description: isUndefinedOrNull(description) ? newProduct.description : description,
				price: isUndefinedOrNull(price) ? newProduct.price : price,
				stock: isUndefinedOrNull(inStock) ? newProduct.stock : inStock,
				images: []
			}
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '55 - 79')
			return res.status(500).send({ message: RESPONSE_500 })
		}

		try {
			//Save Product IMG Url's.
			cloudinary.config({
				cloud_name: process.env.CLOUDINARY_NAME,
				api_key: process.env.CLOUDINARY_API_KEY,
				api_secret: process.env.CLOUDINARY_API_SECRET,
				secure: true,
			})

			for(let index = 0; index < productIMGs.length; index++) {
				secureURL = (await cloudinary.uploader.upload(productIMGs[index].path)).secure_url
				newProduct.images = [...newProduct.images, secureURL]
			}
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '55 - 79')
			return res.status(500).send({ message: RESPONSE_500 })
		}

		try {
			if(sectionInfo) {
				newSection = await SectionModel.findById(sectionInfo._id)

				newProduct.precent = newSection.precent || null
				newProduct.sectionID = sectionInfo._id
				newSection.productID = [...newSection.productID.filter(id => String(id) !== String(newProduct._id)), newProduct._id]

				await SectionModel.updateOne({ _id: newSection._id }, newSection)
			}

			await ProductModel.updateOne({ _id: newProduct._id }, newProduct)
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '55 - 79')
			return res.status(500).send({ message: RESPONSE_500 })
		}

		loger.logResponseData({ newProduct, newSection })
		return res.status(200).send({ newProduct, newSection })
	},
	addSection: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { items, precent, title } = req.body

		let products = []
		let product = {}, productSection = {}

		try {
			productSection = new SectionModel({ _id: new mongoose.Types.ObjectId(), title, precent, items: products })
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '90')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}

		try {
			for(let index = 0; index < items.length; index++) {
				//Find product for add to Products Section.
				product = await ProductModel.findById(items[index])

				product.precent = productSection.precent
				product.inSection = title

				products.push(product)

				//Save product changes (inSection and precent propertie).
				await product.save()
			}

			//Save products in Product Section
			productSection.items = products
			
			await productSection.save()
			
			return res.status(200).send({ section: productSection })
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '97 - 104')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}
	},
	editProductsSection: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { items, title, precent, expiredDate, id, currentProductsID } = req.body

		let product = {}, productsSection = {}
		let products = []

		try {
			productsSection = await SectionModel.findById(id)

			if(!productsSection) return res.status(404).send({ message: RESPONSE_404 })
			
			productsSection.precent = precent || productsSection.precent || 0.0
			productsSection.expiredDate = expiredDate || productsSection.expiredDate || ''
			productsSection.title = title || productsSection.title

			if(currentProductsID.length > 0) {
				for(let index = 0; index < currentProductsID.length; index++) {
					product = await ProductModel.findById(currentProductsID[index])

					product.precent = precent || productsSection.precent || 0
					product.sectionID = productsSection._id

					productsSection.productID = [...productsSection.productID.filter(section => String(section._id) !== String(product._id)), product._id]

					await product.save()
				}
			}

			if(items.length > 0) {
				for(let index = 0; index < items.length; index++) {
					product = await ProductModel.findById(items[index])

					product.precent = precent || productsSection.precent || 0
					product.sectionID = productsSection._id

					productsSection.productID = [...productsSection.productID.filter(section => String(section._id) !== String(product._id)), product._id]
					
					await product.save()
				}
			}

			await productsSection.save()

			products = await ProductModel.find({})
			
			loger.logResponseData({ newSection: productsSection, newProducts: products })
			return res.status(200).send({ newSection: productsSection, newProducts: products })	
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '27 - 29')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })	
		}
	}
}

export default admin
