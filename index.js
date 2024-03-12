import express from 'express'
import cors from 'cors'

import setupServer from './src/config/setupServer.js'
import upload from './src/config/multer.js'

import user from './src/controller/user.js'
import product from './src/controller/product.js'
import admin from './src/controller/admin.js'
import loger from './src/util/loger.js'
import common from './src/controller/common.js'

loger.logCustomText('Date format: year-month-date', false)
loger.logCustomText('Time format: hour-minute-second', false)

const server = express() 

server.use(cors())
server.use(express.json())

export default server

await setupServer()

server.post('/common/user/edit', upload.any(), common.editUserData)
server.get('/common/get/statistic', common.websiteStatistic)
server.post('/common/checkout', common.checkout)
server.post('/common/buy', common.buy)

server.get('/admin/check/:token', admin.controllUser)
server.get('/admin/get/store', admin.getStoreData)
server.post('/admin/product/add', upload.any(), admin.addProduct)
server.post('/admin/product/edit', upload.any(), admin.editProduct)
server.post('/admin/product-section/add', admin.addSection)
server.post('/admin/product-section/edit', admin.editProductsSection)

server.get('/user/:token', user.getUserByToken)
server.post("/user/registration", upload.any(), user.registration)
server.post("/user/login", user.login)
server.get('/user/remove/:token', user.removeUser)

server.get('/product/get/all', product.getAllProducts)
server.get('/product/get/by-id/:id/', product.getProductByID)
server.get('/product/section/remove/:title', product.removeProductSection)
server.post('/product/pagination/filter', product.productPaginationFilter)