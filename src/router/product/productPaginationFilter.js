import Loger from "../../util/loger/loger.js"
import isUndefinedOrNull from '../../util/isUndefinedOrNull.js'
import isAuth from '../../util/isAuth.js'
import getAuthHeader from '../../util/getAuthHeader.js'
import isNewUser from '../../util/isNewUser.js'

import Product from '../../model/product.model.js'
import Category from '../../model/category.model.js'
import Settings from '../../model/settings.model.js'
import Action from '../../model/action.model.js'

import { isValidObjectId } from "mongoose"

import { RESPONSE_404 } from '../../constants/error-constans.js'

export default async function productPaginationFilter(req) {  
  try {
    const timer = new Loger.create.Timer()
    let { location, id, categoriesID, price, rating, page } = req.body

    timer.start('Getting max products per page property')
    const { maxProductsPerPage } = await Settings.findOne({ key: 'default' }, { maxProductsPerPage: true })
    timer.start('Complete')
  
    const start = Number(page) * maxProductsPerPage
    const end = Number(start) + maxProductsPerPage
    const locations = ['category', 'action']
    
    let items = [], categories = []
    let maxPages = 0, currPage = Number(page), maxProducts = 0
    let productsRange = { max: 0, min: 0 }
    let locationTitle

    const user = await isAuth(getAuthHeader(req))
    const isNew = isNewUser(user.createdAt)

    if(locations.includes(location)) {
      Loger.log(`Check objectID "${id}" validity`)
      if(!isValidObjectId(id)) {
        Loger.log(`ObjectID "${id} is not valid"`)
        return RESPONSE_404("Id is not valid!")
      }

      if(location === 'category') {
        const category = await Category.findById(id, undefined, { populate: ['productsID', 'actionID'] })
        locationTitle = category.title
        for(let index = 0; index < category.productsID.length; index++) {
          items.push({...category.productsID[index]._doc, precent: (isNew ? user.precent : category.actionID?.precent) || 0 })
        }
      } else {
        const action = await Action.findById(id, undefined, { populate: ['productsID'] })
        locationTitle = action.title
        for(let index = 0; index < action.productsID.length; index++) {
          items.push({...action.productsID[index]._doc, precent: action.precent })
        }
      }
    } else if(!isUndefinedOrNull(location)) {
      return RESPONSE_404(`${location} is invalid!`)
    } else {
      price = price === 0 ? 1000 : price
      rating = rating === 0 ? 1000 : rating

      timer.start('Filtering products')
      if(categoriesID.length > 0) {
        items = await Product.find({ $and: [{ price: { $lte: price }}, { rating: { $lte: rating }}, { categoryID: { $in: categoriesID } }] }, undefined, { populate: ['actionID'] })
      } else {
        items = await Product.find({ $and: [{ price: { $lte: price }}, { rating: { $lte: rating }}] }, undefined, { populate: ['actionID'] })
      }

      for(let index = 0; index < items.length; index++) {
        if(items[index]?.actionID) items[index]._doc.precent = items[index]?.actionID?.precent || 0
        else if(isNew) items[index]._doc.precent = user.precent || 0
        delete items[index]._doc.actionID
      }
      timer.stop('Complete')
    }

    maxPages = Math.ceil(items.length / maxProductsPerPage)
    Loger.log(`Pages count = ${maxPages}`)

    items = items.slice(start, end)
    Loger.log(`Products start = ${start} | end = ${end}`)
    
    maxProducts = items.length
    Loger.log(`Products count ${maxProducts}`)
    
    timer.start('Getting sections titles')
    categories = await Category.find({}, { title: true })
    timer.stop('Complete')


    Loger.log('Assign max and min values')
    productsRange = { max: end, min: start }
        
    Loger.log('Return response')
    return { currPageProducts: items, locationTitle, productsRange, maxPages, currPage, categories, maxProducts }
  } catch(error) {
    throw new Error(error.message)
  }
}