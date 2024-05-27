import { model, Schema } from 'mongoose'

export default model('product-categories', new Schema({
  _id:          { type: Schema.Types.ObjectId },
  actionID:     { type: String, ref: 'product-actions' },
  productsID:   [{ type: String, ref: 'products' }],
  title:        { type: String, default: '' },
  position:     { type: Number, default: 0 },
  isHidden:     { type: Boolean, default: false },
},              { timestamps: true }))
