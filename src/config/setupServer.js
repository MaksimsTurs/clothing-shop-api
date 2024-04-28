import CreateCache from "../util/cache.js"
import Loger from "../util/loger/loger.js"

import connectDB from './connectDB.js'

import { config } from 'dotenv'

import { DEV_PORT } from '../constants/num-constans.js'
import { CACHE_KEYS, DEV_HOST } from '../constants/string-constans.js'

import proxifier from "../router/routerProxifier.js"

import registration from "../router/user/registration.js"
import login from "../router/user/login.js"
import getUserById from "../router/user/getUserById.js"
import editUser from "../router/user/editUser.js"
import deleteUser from "../router/user/deleteUser.js"

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
    Loger.text('Date format: [year][month][day]')
    Loger.text('Time format: [hour][minute][second][milli seconds]')
    
    Loger.text('Proxifying route callbacks')
    const User = proxifier([registration, login, getUserById, editUser, deleteUser])
    const Product = proxifier([getProductById, productPaginationFilter, getProductByTitle])
    const Other = proxifier([getHomePageData, removeExpiredSection, checkout, createOrder, closeTransaction])
    const Admin = proxifier([editProduct, editSection, editUserAdmin, addProduct, addSection, changeOrderStatus, changeWebsiteSetting, controllUser, deleteItem, getStoreData])
    
    Loger.text('Creating memory storage for uplodaer')
    const storage = memoryStorage({ filename: (_req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`) })

    Loger.text('Creating cache storage')
    const cache = new CreateCache({ cacheKeys: CACHE_KEYS })
    
    server.listen(DEV_PORT, DEV_HOST)  
    await connectDB()

    return { cache, upload: multer({ storage }), User, Product, Other, Admin }
  } catch(error) {
    throw Loger.error(error, import.meta.url)
  }
}