import { model, Schema } from 'mongoose'

const Order = new Schema({
  _id: Schema.Types.ObjectId,
  toBuy: Array
}, { timestamps: true })

export default model('orders', Order)