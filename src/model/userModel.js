import { model, Schema, Types } from 'mongoose'

export default model('users', new Schema({
  _id:        { type: Types.ObjectId },
  firstName:  { type: String, required: true },
  secondName: { type: String, required: true },
  password:   { type: String, required: true },
  email:      { type: String, required: true },
  token:      { type: String, required: true },
  role:       { type: String, default: 'user' },
  avatar:     { type: String }
},            { timestamps: true }))