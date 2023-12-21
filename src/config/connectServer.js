import { server } from "../index.js";

import { config } from 'dotenv'

config()

export default function connectServer() {
  try {
    server.listen(process.env.DEV_PORT, process.env.DEV_HOST, () => console.log(`[SERVER]: START on http://${process.env.DEV_HOST}:${process.env.DEV_PORT}`))
  } catch(error) {
    throw new Error(error)
  }
}