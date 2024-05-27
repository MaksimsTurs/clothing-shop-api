import { model, Schema } from 'mongoose'

export default model('products', new Schema({
	_id: 					{ type: Schema.Types.ObjectId },
	actionID: 		{ type: String, ref: 'product-actions', default: null },
	categoryID:   { type: String, ref: 'product-categories', default: null },
	title: 				{ type: String, default: '' },
	description: 	{ type: String, default: '' },
	price: 				{ type: Number, default: 0 },
	stock: 				{ type: Number, default: 0 },
	rating: 			{ type: Number, default: 0 },
	images: 			{ type: Array, default: [] }
},							{ timestamps: true }))