import { model, Schema } from 'mongoose'

const ToBuy = new Schema({ 
  _id: Schema.Types.ObjectId, 
  title:    { type: String, required: true },
  count:    { type: Number, required: true },
  precent:  { type: Number, default: 0 },
  price:    { type: Number, required: true },
  images:   { type: String, deafult: [] }
})

export default model('orders', new Schema({
  _id:        { type: Schema.Types.ObjectId },
  toBuy:      { type: [ToBuy], default: [] },
  firstName:  { type: String, required: true },
  secondName: { type: String, required: true },
  city:       { type: String, required: true },
  plz:        { type: String, required: true },
  email:      { type: String, required: true },
  adress:     { type: String, required: true },
  status:     { type: String, default: 'SENT' },
},            { timestamps: true }))