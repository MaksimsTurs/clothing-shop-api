import CreateCache from "../util/cache.js"
import Loger from "../util/loger/loger.js"

import connectDB from './connectDB.js'

import { config } from 'dotenv'

import { DEV_PORT } from '../constants/num-constans.js'
import { CACHE_KEYS, DEV_HOST } from '../constants/string-constans.js'

import proxifier from "../router/routerProxifier.js"

import WebsiteSettingModel from '../model/websiteSetting.js'

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

import editUserAdmin from '../router/admin/editUserAdmin.js'
import addProduct from '../router/admin/addProduct.js'
import addSection from '../router/admin/addSection.js'
import changeOrderStatus from '../router/admin/changeOrderStatus.js'
import controllUser from '../router/admin/controllUser.js'
import deleteItem from '../router/admin/deleteItem.js'
import getStoreData from '../router/admin/getStoreData.js'
import changeWebsiteSetting from '../router/admin/changeWebsiteSetting.js'
import editSection from '../router/admin/editSection.js'
import editProduct from '../router/admin/editProduct.js'

import multer, { memoryStorage } from "multer";

config()

export default async function setupServer(server) {
  try {
    const timer = new Loger.create.Timer()

    Loger.log(`Server starting in mode "${process.env.NODE_ENV.trim()}"`)

    timer.start('Start listening server and connecting to mongodb')
    server.listen(DEV_PORT, DEV_HOST)  
    await connectDB()
    timer.stop('Complete')

    timer.start('Getting website settings from database')
    const settings = (await WebsiteSettingModel.find())[0]
    timer.stop('Complete')

    if(!settings) {
      Loger.log('No settings was founded')
      timer.start('Creating and saving website settings')
      await WebsiteSettingModel.create({ defaultDeliveryFee: 5, isAllProductsHidden: false, key: 'websitesettings', maxProductsPerPage: 12 })
      timer.stop('Complete')
    } 

    Loger.log('Proxyfying route functions')
    const User = proxifier([registration, login, getUserById, editUser, deleteUser, authorizate])
    const Product = proxifier([getProductById, productPaginationFilter, getProductByTitle])
    const Other = proxifier([getHomePageData, removeExpiredSection, checkout, createOrder, closeTransaction])
    const Admin = proxifier([editProduct, editSection, editUserAdmin, addProduct, addSection, changeOrderStatus, changeWebsiteSetting, controllUser, deleteItem, getStoreData])
    
    Loger.log('Creating memory storage for image uploader')
    const storage = memoryStorage({ filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) })

    Loger.log('Creating cache storage')
    const cache = new CreateCache({ cacheKeys: CACHE_KEYS })

    return { cache, upload: multer({ storage }), User, Product, Other, Admin }
  } catch(error) {
    throw Loger.error(error, import.meta.url)
  }
}