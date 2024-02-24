import { model, Schema } from 'mongoose'

export const ProductSection = new Schema(
	{
    _id: Schema.Types.ObjectId,
    productID: Array,
    title: String,
    precent: Number,
    expiredDate: Date
  },
	{ timestamps: true }
)

export default model('product-sections', ProductSection)
