import { model, Schema } from 'mongoose'

export default model('orders', new Schema({
  _id:    { type: Schema.Types.ObjectId },
  toBuy:  { type: Array, default: [] }
},        { timestamps: true }))