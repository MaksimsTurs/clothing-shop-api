import { model, Schema } from 'mongoose'

export default model('product-sections', new Schema({
  _id:          { type: Schema.Types.ObjectId },
  precent:      { type: Number, default: 0 },
  position:     { type: Number, default: 0 },
  isHidden:     { type: Boolean, default: false },
  title:        { type: String },
  expiredDate:  { type: Date },
  productsID:   [{ type: String, ref: 'products' }]
},              { timestamps: true }))
