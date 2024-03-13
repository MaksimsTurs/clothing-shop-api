import { connect } from 'mongoose'
import { config } from 'dotenv';

import loger from "../util/loger.js";

config()

export default async function connectDB() {
  const currDB = process.env.NODE_ENV === 'dev' ? 'dev-db' : 'clothing-shop'
  const DBURL = `${process.env.MONGO_DB_URI}${currDB}?retryWrites=true&w=majority`

  try {
    await connect(DBURL)
    loger.logCustomText('Connected to MongoDB!', true)
    loger.logCustomText(`DB URL: ${DBURL}`)
  } catch(error) {
    throw loger.logError(error, import.meta.url, '12 - 13')
  }
}