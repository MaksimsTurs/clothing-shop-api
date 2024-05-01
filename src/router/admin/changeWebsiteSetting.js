import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import { writeFile } from "fs/promises"
import path from "path"

export default async function changeWebsiteSetting(req) {
  try {
    const timer = new Loger.create.Timer()

    timer.start('Update website settings')
    await writeFile(path.join(process.cwd(), 'settings.json'), JSON.stringify(req.body), { encoding: 'utf-8' })
    timer.stop('Updating website settings')

    cache.restore()

    return req.body
  } catch(error) {
    throw new Error(error.message)
  }
}