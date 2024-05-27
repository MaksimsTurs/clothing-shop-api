import { model, Schema } from 'mongoose'

export default model('settings', new Schema({
  key:                  { type: String, default: 'default' },
  isAllProductsHidden:  { type: Boolean, default: false },
  deliveryFee:          { type: Number, default: 0 },
  maxProductsPerPage:   { type: Number, default: 12 }
},							        { timestamps: true }))