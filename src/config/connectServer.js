import { server } from "../../index.js";

import chalk from 'chalk'

import loger from "../util/loger.js";

export default function connectServer() {
  try {
    server.listen(process.env.DEV_PORT, process.env.DEV_HOST, () => {
      loger.logCustomInfo('Connected to Server!')
      if(process.env.DEV_PORT !== undefined) loger.logCustomInfo(`Listen http://${process.env.DEV_PORT}/${process.env.DEV_HOST}`)
    })  
  } catch(error) {
    loger.logCatchError(error, import.meta.url)
  }
}