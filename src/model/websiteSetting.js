import { model, Schema } from 'mongoose'

export default model('settings', new Schema({
  key:                  { type: String, default: 'websitesettings' },
  isAllProductsHidden:  { type: Boolean },
  deliveryFee:          { type: Number, default: 0 },
  maxProductsPerPage:   { type: Number, default: 12 }
},							        { timestamps: true }))