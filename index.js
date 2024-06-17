import express from 'express'
import cors from 'cors'

import setupServer from './src/config/setupServer.js'

import { loginValidator, registrationValidator, createOrderValidator } from './src/validation/userInput.js'

const server = express() 

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

export const { cache, upload, User, Product, Other, Admin } = await setupServer(server)

server.get('/',                                 Other.getHomePageData)
server.get('/remove-section/:title',            Other.removeExpiredAction)
server.post('/check-cart',                      Other.checkout)
server.get('/create-order/:checkID',            Other.createOrder)
server.post('/close-transaction',               createOrderValidator, Other.closeTransaction)
/*----------------------------------------------------------------------------------------------------*/
server.get('/user/:id',                         User.getUserById)
server.get('/user/remove/:id',                  User.deleteUser)
server.post('/user/auth',                       User.authenticate)
server.post("/user/login",                      upload.any(), loginValidator, User.login)
server.post("/user/registration",               upload.any(), registrationValidator, User.registration)
server.post('/user/edit',                       upload.any(), User.editUser)
/*----------------------------------------------------------------------------------------------------*/
server.get('/product/:id',                      Product.getProductById)
server.get('/product/find-by-title/:title',     Product.getProductByTitle)
server.post('/product/filter-and-pagination',   Product.productPaginationFilter)
/*----------------------------------------------------------------------------------------------------*/
server.get('/admin/check/:token',               Admin.controllUser)
server.post('/admin/update/setting',            Admin.updateSetting)
server.get('/admin/get/store',                  Admin.getStoreData)
server.get('/admin/remove/item/:id/:from',      Admin.removeItem)
server.get('/admin/clear/cache',                Admin.clearCache)
server.post('/admin/insert/action',             Admin.insertProductAction)
server.post('/admin/insert/category',           Admin.insertCategory)
server.post('/admin/update/action',             Admin.updateProductAction)
server.post('/admin/update/category',           Admin.updateCategory)
server.post('/admin/order/change-status',       Admin.changeOrderStatus)
server.post('/admin/update/product',            upload.any(), Admin.updateProduct)
server.post('/admin/insert/product',            upload.any(), Admin.insertProduct)
server.post('/admin/update/user',               upload.any(), Admin.updateUserAdmin)

export default server