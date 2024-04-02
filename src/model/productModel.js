import { model, Schema } from 'mongoose'

export default model('products', new Schema({
	_id: 					{ type: Schema.Types.ObjectId },
	sectionID: 		{ type: String, ref: 'product-sections' },
	title: 				{ type: String },
	description: 	{ type: String },
	price: 				{ type: Number },
	stock: 				{ type: Number },
	precent: 			{ type: Number },
	rating: 			{ type: Number },
	images: 			{ type: Array },
	category: 		{ type: String }
},							{ timestamps: true }))
