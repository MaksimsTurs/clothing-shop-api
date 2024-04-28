import { model, Schema } from 'mongoose'

export default model('products', new Schema({
	_id: 					{ type: Schema.Types.ObjectId },
	sectionID: 		{ type: String, ref: 'product-sections', default: null },
	title: 				{ type: String, default: null },
	description: 	{ type: String, default: null },
	category: 		{ type: String, default: null },
	price: 				{ type: Number, default: 0 },
	stock: 				{ type: Number, default: 0 },
	precent: 			{ type: Number, default: 0 },
	rating: 			{ type: Number, default: 0 },
	images: 			{ type: Array, default: [] }
},							{ timestamps: true }))