import Loger from "../../util/loger/loger.js"
import checker from "../../util/checker.js"

import { cache } from "../../../index.js"

import Setting from '../../model/settings.model.js'

export default async function updateSetting(req) {
  try {
    const timer = new Loger.create.Timer()
    
    let settings

    timer.start()
    settings = await Setting.findOneAndUpdate({ key: 'default' }, checker.isNotEmpty(req.body), { new: true })
    timer.stop('Update website settings')

    Loger.log('Restore cache')
    cache.restore()

    return settings
  } catch(error) {
    throw new Error(error.message)
  }
}