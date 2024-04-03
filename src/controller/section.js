import loger from '../util/loger.js'

import SectionModel from '../model/productSectionModel.js'
import ProductModel from '../model/productModel.js'

import { RESPONSE_200 } from '../constants/succes-constans.js'
import { RESPONSE_500 } from '../constants/error-constans.js'

export default {
  deleteSectionByTitle: async (req, res) => {
    const { originalUrl, body, params } = req
    loger.request(originalUrl, body, params)

    const title = params.title.replace('%20', ' ')

    let section = {}

    try {
      section = await SectionModel.findOneAndDelete({ title })
      await ProductModel.updateMany({ _id: { $in: section.productsID } }, { precent: null, sectionID: null })

      res.status(200).send(RESPONSE_200())
      return loger.response(RESPONSE_200())
    } catch(error) {
      loger.error(error, '/controller/section.js', 'Delete section when their timer is ended.')
      res.status(500).send(RESPONSE_500())
    }
  }
}