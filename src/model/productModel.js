import { model, Schema } from 'mongoose'

export const Product = new Schema(
	{
		title: String,
		description: String,
		cost: Number,
		precent: Number,
		stock: Number,
		rating: Number,
		images: Array,
		inSection: Boolean
	},
	{ timestamps: true }
)

export default model('products', Product)
