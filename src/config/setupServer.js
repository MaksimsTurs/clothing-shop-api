import CreateCache from "../util/cache.js"
import Loger from "../util/loger/loger.js"

import connectDB from './connectDB.js'

import { config } from 'dotenv'

import { DEV_PORT } from '../constants/num-constans.js'
import { CACHE_KEYS, DEV_HOST } from '../constants/string-constans.js'

import proxifier from "../router/routerProxifier.js"

import WebsiteSettingModel from '../model/settings.model.js'

import registration from "../router/user/registration.js"
import login from "../router/user/login.js"
import getUserById from "../router/user/getUserById.js"
import editUser from "../router/user/editUser.js"
import deleteUser from "../router/user/deleteUser.js"
import authorizate from "../router/user/authorizate.js"

import getProductById from "../router/product/getProductById.js"
import productPaginationFilter from "../router/product/productPaginationFilter.js"
import getProductByTitle from "../router/product/getProductByTitle.js"

import getHomePageData from "../router/other/getHomePageData.js"
import removeExpiredSection from "../router/other/removeExpiredSection.js"
import checkout from "../router/other/checkout.js"
import createOrder from "../router/other/createOrder.js"
import closeTransaction from "../router/other/closeTransaction.js"

import insertProduct from '../router/admin/insertProduct.js'
import insertProductAction from '../router/admin/insertProductAction.js'
import insertCategory from "../router/admin/insertCategory.js"
import updateProduct from '../router/admin/updateProduct.js'
import updateProductAction from '../router/admin/updateProductAction.js'
import updateCategory from '../router/admin/updateCategory.js'
import updateUserAdmin from '../router/admin/updateUserAdmin.js'
import updateSetting from '../router/admin/updateSetting.js'
import removeItem from '../router/admin/removeItem.js'
import changeOrderStatus from '../router/admin/changeOrderStatus.js'
import controllUser from '../router/admin/controllUser.js'
import getStoreData from '../router/admin/getStoreData.js'

import multer, { memoryStorage } from "multer";

config()

export default async function setupServer(server) {
  try {
    const timer = new Loger.create.Timer()

    Loger.log(`Server starting in mode "${process.env.NODE_ENV.trim()}"`)

    timer.start('Listening server and connecting to mongodb')
    server.listen(DEV_PORT, DEV_HOST)  
    await connectDB()
    timer.stop('Listening server and connecting to mongodb')

    timer.start('')
    const settings = (await WebsiteSettingModel.find())[0]
    timer.stop('Getting website settings from database')

    if(!settings) {
      Loger.log('No settings was founded')
      timer.start('Creating and saving website settings')
      await WebsiteSettingModel.create({ defaultDeliveryFee: 5, isAllProductsHidden: false, key: 'websitesettings', maxProductsPerPage: 12 })
      timer.stop('Creating and saving website settings')
    } 

    Loger.log('Proxyfying route functions')
    const User = proxifier([
      registration, 
      login, 
      getUserById, 
      editUser, 
      deleteUser, 
      authorizate
    ])
    const Product = proxifier([
      getProductById, 
      productPaginationFilter, 
      getProductByTitle
    ])
    const Other = proxifier([
      getHomePageData, 
      removeExpiredSection, 
      checkout, 
      createOrder, 
      closeTransaction
    ])
    const Admin = proxifier([
      insertProduct, 
      insertProductAction, 
      updateProduct, 
      updateProductAction, 
      updateCategory,
      updateUserAdmin, 
      changeOrderStatus, 
      removeItem, 
      updateSetting,
      controllUser, 
      insertCategory,
      getStoreData
    ])
    
    Loger.log('Creating memory storage for image uploader')
    const storage = memoryStorage({ filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) })

    Loger.log('Creating cache storage')
    const cache = new CreateCache({ cacheKeys: CACHE_KEYS, isDisable: false })

    return { cache, upload: multer({ storage }), User, Product, Other, Admin }
  } catch(error) {
    throw Loger.error(error, import.meta.url)
  }
}