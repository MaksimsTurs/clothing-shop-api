import Loger from "../../util/loger/loger.js"

import { cache } from "../../../index.js"

import WebsiteSettingsModel from '../../model/websiteSetting.js'

export default async function changeWebsiteSetting(req) {
  try {
    const timer = new Loger.create.Timer()

    timer.start('Update website settings')
    await WebsiteSettingsModel.updateOne({ key: 'websitesettings' }, {
      deliveryFee: parseFloat(req.body.deliveryFee).toFixed(2),
      maxProductsPerPage: parseInt(req.body.maxProductsPerPage),
      isAllProductsHidden: req.body.isAllProductsHidden
    })
    timer.stop('Complete')

    Loger.log('Restore cache')
    cache.restore()

    return req.body
  } catch(error) {
    throw new Error(error.message)
  }
}