import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import { writeFile } from "fs/promises"
import path from "path"

export default async function changeWebsiteSetting(req) {
  const timer = new Loger.create.Timer()

  try {
    timer.start('READ_SETTING')
    await writeFile(path.join(process.cwd(), 'settings.json'), JSON.stringify(req.body), { encoding: 'utf-8' })
    timer.stop('Updating website settings', 'READ_SETTING')

    cache.restore()

    return req.body
  } catch(error) {
    throw new Error(error.message)
  }
}