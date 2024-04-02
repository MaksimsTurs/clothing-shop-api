import { model, Schema } from 'mongoose'

export default model('product-sections', new Schema({
  _id:          { type: Schema.Types.ObjectId },
  title:        { type: String },
  productsID:   [{ type: String, ref: 'products' }],
  precent:      { type: Number },
  expiredDate:  { type: Date }
},              { timestamps: true }))
