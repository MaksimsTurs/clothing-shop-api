import loger from '../util/loger.js'
import isAuthorizated from '../util/isAuthorizated.js'
import isUndefinedOrNull from '../util/isUndefinedOrNull.js'

import ProductModel from '../model/productModel.js'
import UserModel from '../model/userModel.js'
import SectionModel from '../model/productSectionModel.js'

import mongoose, { isValidObjectId } from 'mongoose'

import { RESPONSE_404, RESPONSE_500 } from '../constants/error-constans.js'

import removeImages from '../util/data-utils/removeImages.js'
import convertAndSave from '../util/data-utils/convertAndSave.js'

const admin = {
	controllUser: async (req, res) => {
		const { originalUrl, body, params } = req
		loger.request(originalUrl, body, params)

		try {
			const { code, message } = await isAuthorizated(params.token, true)

			res.status(code).send({ code, message })
			loger.response({ code, message })
		} catch(error) {
			loger.error(error, '/controll/admin.js', 'Controll, is user authorizated.')
			return res.status(500).send(RESPONSE_500())	
		}
	},
	getStoreData: async (req, res) => {
		const { originalUrl, body, params } = req
		loger.request(originalUrl, body, params)

		let products = [], productsSection = [], users = []
		let response = {}

		try {
			products = await ProductModel.find({}, { __v: false })
			users = await UserModel.find({}, { token: false, __v: false, password: false })
			productsSection = await SectionModel.find({}, { __v: false }, { populate: { path: 'productsID' } })

			for(let index = 0; index < productsSection.length; index++) {
				productsSection[index] = {
					...productsSection[index]._doc, 
					productsID: productsSection[index].productsID.map(product => product._id), 
					products: productsSection[index].productsID }
			}
						
			response = { products, productsSection, users }

			res.status(200).send(response)
			loger.response(response)
		} catch(error) {
			loger.error(error, '/controller/admin.js', 'Get products, sections and users data from database.')
			return res.status(500).send(RESPONSE_500())
		}
	},
	deleteItem: async (req, res) => {
		const { originalUrl, body, params } = req
		loger.request(originalUrl, body, params)

		const { id, from } = params

		let product = {}, section = {}

		try {
			if(!isValidObjectId(id)) return res.status(404).send(RESPONSE_404("ID is not valid!"))
			
			switch(from) {
				case 'product':
					product = await ProductModel.findByIdAndDelete(id)
					if(product && product.images.length > 0) await removeImages(product.images)
					if(product.sectionID) section = await SectionModel.updateOne({ _id: product.sectionID }, { $pull: { _id: product._id } })
				break;
				case 'product-section':
					section = await SectionModel.findByIdAndDelete(id)
					await ProductModel.updateMany({ _id: { $in: section.productsID } }, { precent: null, sectionID: '', category: '' })
				break;
			}

			res.status(200).send({ id })
			loger.response({ id }) 
		} catch(error) {
			loger.error(error, '/controller/admin.js', 'Delete item and return id.')
			return res.status(500).send(RESPONSE_500())	
		}
	},
	addProduct: async (req, res) => {
		const { originalUrl, body, files, file, params } = req
		loger.request(originalUrl, body, params)

		const { title, price, stock, description, selectedSection, rating } = body
		const sectionData = isUndefinedOrNull(selectedSection) ? undefined : JSON.parse(selectedSection) // { _id: string, title: string }

		let newProduct = {}, updatedSection = {}

		try {
			newProduct = new ProductModel({ _id: new mongoose.Types.ObjectId(), images: await convertAndSave(file || files, 85), title, description, price, stock, rating })
			
			//Will be called when ADMIN have selected the section, push new Product ID in existed section.
			if(sectionData) {
				updatedSection = await SectionModel.findByIdAndUpdate(sectionData._id, { $push: { productsID: newProduct._id } }, { new: true })
				newProduct.sectionID = updatedSection._id
				newProduct.precent = updatedSection.precent
				newProduct.category = updatedSection.title
			}		
			
			await newProduct.save()

			const response = { newProduct, updatedSection }

			res.status(200).send(response)	
			loger.response(response)
		} catch(error) {
			loger.error(error, '/controller/admin.js', 'Create new product, update section and send data to the client.')
			return res.status(500).send(RESPONSE_500())
		}
	},
	addSection: async (req, res) => {
		const { originalUrl, body, params } = req
		loger.request(originalUrl, body, params)

		const { productsID, precent, title, expiredDate } = body

		let newSection = {}
		
		try {
			newSection = await SectionModel.create({ _id: new mongoose.Types.ObjectId(), title, precent, productsID, expiredDate })
			await ProductModel.updateMany({ _id: { $in: productsID } }, { precent, sectionID: newSection._id, category: newSection.title })
			
			res.status(200).send({ newSection })
			loger.request({ newSection })
		} catch(error) {
			loger.error(error, '/controller/admin.js', 'Create new Section model.')
			return res.status(500).send(RESPONSE_500())
		}
	},
	editProduct: async (req, res) => {
		const { originalUrl, body, files, file, params } = req
		loger.request(originalUrl, body, params)

		const { selectedSection, title, price, stock, description, productID, rating } = req.body 
		const sectionData = isUndefinedOrNull(selectedSection) ? undefined : JSON.parse(selectedSection) // { _id: string, title: string }

		let updatedProduct = {}, updatedProductsSection = undefined
		
		try {
			updatedProduct = await ProductModel.findById({ _id: productID })

			//When section was selected, push the new ID and update product.
			if(sectionData) updatedProductsSection = await SectionModel.findByIdAndUpdate(sectionData._id, { $push: { productsID: updatedProduct._id } }, { new: true })

			updatedProduct = await ProductModel.findByIdAndUpdate(productID, {
				...updatedProduct._doc,
				title: isUndefinedOrNull(title) ? updatedProduct.title : title,
				description: isUndefinedOrNull(description) ? updatedProduct.description : description,
				price: isUndefinedOrNull(price) ? updatedProduct.price : price,
				stock: isUndefinedOrNull(stock) ? updatedProduct.stock : stock,
				rating: isUndefinedOrNull(rating) ? updatedProduct.rating : rating,
				precent: isUndefinedOrNull(updatedProductsSection?.precent) ? null : updatedProductsSection.precent,
				sectionID: isUndefinedOrNull(sectionData?._id) ? null : sectionData._id,
				images: (file || (files.length > 0)) ? await convertAndSave(file || files, 85) : updatedProduct.images
			}, { new: true })

			const response = { updatedProduct, updatedProductsSection }

			res.status(200).send(response)
			loger.response(response)
		} catch(error) {
			console.log(error)
			loger.error(error, '/controller/admin.js', 'Edit product and send to the client.')
			return res.status(500).send(RESPONSE_500())
		}
	},
	editProductsSection: async (req, res) => {
		const { originalUrl, body, params } = req
		loger.request(originalUrl, body, params)

		const { productsID, title, precent, expiredDate, id, currentProductsID } = body

		let updatedProductsSection = undefined
		let items = [...productsID, ...currentProductsID] //New and older product ids

		try {
			updatedProductsSection = await SectionModel.findById(id)
			
			if(!updatedProductsSection) return res.status(404).send(RESPONSE_404("Section not founded!"))

			updatedProductsSection.title = isUndefinedOrNull(title) ? updatedProductsSection.title : title
			updatedProductsSection.precent = isUndefinedOrNull(precent) ? updatedProductsSection.precent : precent
			updatedProductsSection.expiredDate = isUndefinedOrNull(expiredDate) ? updatedProductsSection.expiredDate : expiredDate
			
			//Update their Products.
			if(items.length > 0) {
				await ProductModel.updateMany({ _id: { $in: items } }, { 
					precent: isUndefinedOrNull(precent) ? updatedProductsSection.precent : precent, 
					category: isUndefinedOrNull(title) ? updatedProductsSection.title : title,
					sectionID: updatedProductsSection._id
				})
				for(let index = 0; index < items.length; index++) if(!updatedProductsSection.productsID.includes(items[index])) updatedProductsSection.productsID.push(items[index])
			}

			await updatedProductsSection.save()
			
			const response = { updatedProductsSection }

			res.status(200).send(response)	
			loger.response(response)
		} catch(error) {
			loger.error(error, '/controller/admin.hs', 'Update section, products and send new data to the client.')
			return res.status(500).send(RESPONSE_500())	
		}
	}
}

export default admin