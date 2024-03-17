import { model, Schema } from 'mongoose'

const Order = new Schema({
  _id: Schema.Types.ObjectId,
  toBuy: { type: Array, default: [] }
}, { timestamps: true })

export default model('orders', Order)