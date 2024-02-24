import { connect } from 'mongoose'
import { config } from 'dotenv';

import loger from "../util/loger.js";

config()

export default async function connectMongoDB() {
  console.log(process.env.MONGO_DB_URI)
  try {
    await connect(process.env.MONGO_DB_URI)
    loger.logCustomInfo('Connected to MongoDB!')
  } catch(error) {
    loger.logCatchError(error, import.meta.url)
  }
}