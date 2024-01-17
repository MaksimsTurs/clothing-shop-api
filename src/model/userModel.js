import { model, Schema } from 'mongoose'

export const User = new Schema({
  firstName: String,
  secondName: String,
  password: String,
  avatar: String,
  email: String,
  token: String,
  isActive: Boolean,
  role: { type: String, default: 'user' }
}, { timestamps: true })

export default model('users', User)