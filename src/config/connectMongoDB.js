import { connect } from 'mongoose'

import chalk from 'chalk'

import loger from "../util/loger.js";

export default async function connectMongoDB() {
  try {
    await connect(process.env.MONGO_DB_URI)
    loger.logCustomInfo('Connected to MongoDB!')
  } catch(error) {
    loger.logCatchError(error, import.meta.url)
  }
}