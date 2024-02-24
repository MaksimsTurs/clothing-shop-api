import { model, Schema } from 'mongoose'

const Product = new Schema(
	{
		_id: Schema.Types.ObjectId,
		sectionID: String,
		title: String,
		description: String,
		price: Number,
		stock: Number,
		precent: Number,
		rating: Number,
		images: Array,
		categories: Array
	},
	{ timestamps: true }
)

export default model('products', Product)
