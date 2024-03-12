import { connect } from 'mongoose'
import { config } from 'dotenv';

import loger from "../util/loger.js";

config()

export default async function connectDB() {
  const database = 'clothing-shop'

  try {
    await connect(`${process.env.MONGO_DB_URI}${database}?retryWrites=true&w=majority`)
    loger.logCustomText('Connected to MongoDB!', true)
  } catch(error) {
    loger.logError(error, import.meta.url, '12 - 13')
  }
}