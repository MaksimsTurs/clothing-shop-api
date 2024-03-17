import { model, Schema } from 'mongoose'

const Product = new Schema(
	{
		_id: Schema.Types.ObjectId,
		sectionID: { type: String, default: null },
		title: { type: String, default: null },
		description: { type: String, default: null },
		price: { type: Number, default: 0.00 },
		stock: { type: Number, default: 0 },
		precent: { type: Number, default: 0.00 },
		rating: { type: Number, default: 0.0 },
		images: { type: Array, default: [] },
		categories: { type: Array, default: [] }
	},
	{ timestamps: true }
)

export default model('products', Product)
