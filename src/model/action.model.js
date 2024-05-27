import { model, Schema } from 'mongoose'

export default model('product-actions', new Schema({
  _id:          { type: Schema.Types.ObjectId },
  categoryID:   { type: String, ref: 'product-categories' },
  productsID:   [{ type: String, ref: 'products' }],
  title:        { type: String, default: '' },
  precent:      { type: Number, default: 0 },
  position:     { type: Number, default: 0 },
  isHidden:     { type: Boolean, default: false },
  expiredAt:    { type: Date, default: null },
},              { timestamps: true }))
