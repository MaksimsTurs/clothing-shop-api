import { model, Schema, Types } from 'mongoose'

export const User = new Schema({
  _id: Types.ObjectId,
  firstName: String,
  secondName: String,
  password: String,
  avatar: String,
  email: String,
  token: String,
  role: { type: String, default: 'user' }
}, { timestamps: true })

export default model('users', User)