import express from 'express'
import cors from 'cors'

import setupServer from './src/config/setupServer.js'

import { loginValidator, registrationValidator, createOrderValidator } from './src/validation/userInput.js'

import Loger from './src/util/loger/loger.js'

const server = express() 
const timer = new Loger.create.Timer()

server.use(cors())
server.use(express.json())
server.use(express.urlencoded({ extended: true }))

timer.start('Starting configuring server')
export const { cache, upload, User, Product, Other, Admin } = await setupServer(server)
timer.stop('Completed')

server.get('/',                                 Other.getHomePageData)
server.get('/remove-section/:title',            Other.removeExpiredSection)
server.post('/check-cart',                      Other.checkout)
server.get('/create-order/:checkID',            Other.createOrder)
server.post('/close-transaction',               createOrderValidator, Other.closeTransaction)
/*----------------------------------------------------------------------------------------------------*/
server.get('/user/:id',                         User.getUserById)
server.get('/user/remove/:id',                  User.deleteUser)
server.post("/user/login",                      upload.any(), loginValidator, User.login)
server.post("/user/registration",               upload.any(), registrationValidator, User.registration)
server.post('/user/edit',                       upload.any(), User.editUser)
server.post('/user/auth',                       User.authorizate)
/*----------------------------------------------------------------------------------------------------*/
server.get('/product/:id',                      Product.getProductById)
server.get('/product/find-by-title/:title',     Product.getProductByTitle)
server.post('/product/filter-and-pagination',   Product.productPaginationFilter)
/*----------------------------------------------------------------------------------------------------*/
server.get('/admin/check/:token',               Admin.controllUser)
server.post('/admin/website-setting/edit',      Admin.changeWebsiteSetting)
server.get('/admin/get/store',                  Admin.getStoreData)
server.get('/admin/delete-item/:id/:from',      Admin.deleteItem)
server.post('/admin/product-section/add',       Admin.addSection)
server.post('/admin/product-section/edit',      Admin.editSection)
server.post('/admin/order/change-status',       Admin.changeOrderStatus)
server.post('/admin/product/edit',              upload.any(), Admin.editProduct)
server.post('/admin/product/add',               upload.any(), Admin.addProduct)
server.post('/admin/user/edit',                 upload.any(), Admin.editUserAdmin)

export default server