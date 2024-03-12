import server from '../../index.js'

import loger from "../util/loger.js"

import connectDB from './connectDB.js'

import { config } from 'dotenv'

import { DEV_PORT } from '../constants/num-constans.js'
import { DEV_HOST } from '../constants/string-constans.js'

config()

export default function setupServer() {
  try {
    server.listen(DEV_PORT, DEV_HOST, async () => {
      loger.logCustomText(`Connected to Server, Listen http://${DEV_HOST}:${DEV_PORT}`, true)
      await connectDB()
    })  
  } catch(error) {
    loger.logError(error, import.meta.url, '16 - 19')
  }
}