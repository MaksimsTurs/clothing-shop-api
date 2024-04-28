import { RESPONSE_200 } from "../../constants/succes-constans.js"

import Loger from "../../util/loger/loger.js"

export default async function removeExpiredSection(req, res) {
  const timer = new Loger.create.Timer()
  
  const title = req.params.title.replaceAll('%20', ' ')

  let section
  
  try {
    timer.start('REMOVE_SECTION')
    section = await SectionModel.findOneAndDelete({ title })
    timer.stop('Complete removing products section by title', 'REMOVE_SECTION')

    timer.start('UPDATING_PRODUCTS')
    await ProductModel.updateMany({ _id: { $in: section.productsID } }, { precent: null, sectionID: null })
    timer.stop('Complete updating products', 'UPDATING_PRODUCTS')

    return RESPONSE_200("Successfuly removed!")
  } catch(error) {
    throw new Error(error.message)
  }
}