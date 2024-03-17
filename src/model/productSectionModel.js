import { model, Schema } from 'mongoose'

export const ProductSection = new Schema(
	{
    _id: Schema.Types.ObjectId,
    productIDs: { type: Array, default: [] },
    title: { type: String, default: null },
    precent: { type: Number, default: 0.0 },
    expiredDate: { type: Date, default: null }
  },
	{ timestamps: true }
)

export default model('product-sections', ProductSection)
