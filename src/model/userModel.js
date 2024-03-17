import { model, Schema, Types } from 'mongoose'

export const User = new Schema({
  _id: Types.ObjectId,
  firstName: { type: String, required: true },
  secondName: { type: String, required: true },
  password: { type: String, required: true },
  avatar: { type: String, default: null },
  email: { type: String, required: true },
  token: { type: String, required: true },
  role: { type: String, default: 'user' }
}, { timestamps: true })

export default model('users', User)