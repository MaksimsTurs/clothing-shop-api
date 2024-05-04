import { model, Schema } from 'mongoose'

export default model('orders', new Schema({
  _id:        { type: Schema.Types.ObjectId },
  toBuy:      { type: [{ 
                _id: Schema.Types.ObjectId, 
                title: String,
                count: Number,
                precent: Number,
                price: Number,
                images: String
              }], default: [] },
  firstName:  { type: String },
  secondName: { type: String },
  city:       { type: String },
  plz:        { type: String },
  email:      { type: String },
  adress:     { type: String, required: true },
  status:     { type: String, default: 'SENT' },
},            { timestamps: true }))