import loger from '../util/loger.js'
import userControllU from '../util/userControllU.js'

import ProductModel from '../model/productModel.js'
import UserModel from '../model/userModel.js'
import SectionModel from '../model/productSectionModel.js'

import { v2 as cloudinary } from 'cloudinary'

const admin = {
	controllUser: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { code, message } = await userControllU(req.params.token || req.body.token || null)

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
			return res.status(200).send({ products, productsSection, users })
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '27 - 29')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}
	},
	addProduct: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { title, cost, inStock, description, sectionName } = req.body

		const productImgs = req.files

		let secureURL = '', newProduct = {}, sectionList = {}

		try {
			//Create new Product and save their images.
			newProduct = new ProductModel({ title, cost,	stock: inStock || 0,	description, rating: 0	})
			
			for (let index = 0; index < productImgs.length; index++) {
				cloudinary.config({
					cloud_name: process.env.CLOUDINARY_NAME,
					api_key: process.env.CLOUDINARY_API_KEY,
					api_secret: process.env.CLOUDINARY_API_SECRET,
					secure: true,
				})

				secureURL = (await cloudinary.uploader.upload(productImgs[index].path)).secure_url
				newProduct.images.push(secureURL)
			}

			// If listNames is not undefined, save product in section.
			if(sectionName) {
				sectionList = await SectionModel.findOne({ title: sectionName })

				newProduct.precent = sectionList.precent
				newProduct.inSection = true
				sectionList.items.unshift(newProduct)
			
				await sectionList.save()
			}

			await newProduct.save()

			return res.status(200).send({...newProduct._doc})
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '55 - 79')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}
	},
	addSection: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { items, precent, title } = req.body

		let products = [], productsID = [], product = {}, productSection = {}

		try {
			productSection = SectionModel({ items: products, title, precent: precent || 0.0 })
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '90')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}

		try {
			for(let index = 0; index < items.length; index++) {
				product = await ProductModel.findById(items[index])
				if(productSection.precent > 0.0) product.precent = productSection.precent
				product.inSection = true
				products.push(product)
				productsID.push(product._id)
				await product.save()
			}

			productSection.items = products
			await productSection.save()
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '97 - 104')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}
		
		return res.status(200).send({ section: productSection, productsID, products })
	},
	editProduct: async (req, res) => {
		loger.logURLRequest(req.protocol, req.hostname, req.originalUrl, req.body)

		const { title, cost, inStock, description, sectionName, token, id } = req.body
		const { code, message } = await userControllU(token, true)	

		if(code !== 200) return res.status(code).send({ message })
		
		let existedProduct = {}, newProduct = {}, productsSection = {}

		try {
			existedProduct = await ProductModel.findOne({ _id: id })
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '126')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}

		if(!existedProduct) return res.status(404).send({ message: process.env.SERVER_404_RESPONSE_MESSAGE })

		try {
			newProduct = {
				_id: existedProduct._id,
				title: title || existedProduct.title,
				description: description || existedProduct.description,
				cost: cost || existedProduct.cost,
				inStock: inStock || existedProduct.stock,
				rating: existedProduct.rating,
				createdAt: existedProduct.createdAt,
				updatedAt: Date.now(),
				inSection: existedProduct.inSection,
				images: existedProduct.images,
				precent: existedProduct.precent,
			}

			await ProductModel.updateOne({ title: existedProduct.title }, newProduct)

			await existedProduct.save()

			return res.status(200).send(newProduct)
		} catch(error) {
			loger.logCatchError(error, import.meta.url, '135 - 143')
			return res.status(500).send({ message: process.env.SERVER_500_RESPONSE_MESSAGE })
		}
	}
}

export default admin
