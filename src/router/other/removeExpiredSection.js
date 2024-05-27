import { RESPONSE_200 } from "../../constants/succes-constans.js"

import Loger from "../../util/loger/loger.js"

import SectionModel from '../../model/action.model.js'
import ProductModel from '../../model/order.model.js'

export default async function removeExpiredSection(req) {  
  try {
    const timer = new Loger.create.Timer()
    const title = req.params.title.replaceAll('%20', ' ')
  
    timer.start(`Removing section by title "${title}"`)
    await SectionModel.deleteOne({ title })
    timer.stop(`Complete`)

    timer.start('Update products where havent relation with section')
    await ProductModel.updateMany({ category: title }, { precent: null, sectionID: null, category: null })
    timer.stop('Complete')

    return RESPONSE_200("Successfuly removed!")
  } catch(error) {
    throw new Error(error.message)
  }
}