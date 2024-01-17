import { model, Schema } from 'mongoose'

import { Product } from './productModel.js'

export const ProductSection = new Schema(
	{
    title: String,
    items: [Product],
    precent: Number
  },
	{ timestamps: true }
)

export default model('product-sections', ProductSection)
