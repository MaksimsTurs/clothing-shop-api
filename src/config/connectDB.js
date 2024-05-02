import { connect } from 'mongoose'
import { config } from 'dotenv';

import Loger from "../util/loger/loger.js";

config()

export default async function connectDB() {
  const currDB = process.env.NODE_ENV.trim() === 'dev' ? 'dev-db' : 'clothing-shop'
  const DBURL = `${process.env.MONGO_DB_URI}${currDB}?retryWrites=true&w=majority`
  
  try {
    await connect(DBURL)
  } catch(error) {
    return Loger.error(error, import.meta.url)
  }
}