import express from 'express'
import cors from 'cors'

import connectServer from './src/config/connectServer.js'
import connectMongoDB from './src/config/connectMongoDB.js'
import upload from './src/config/multer.js'

import user from './src/controller/user.js'
import product from './src/controller/product.js'
import admin from './src/controller/admin.js'
import loger from './src/util/loger.js'
import common from './src/controller/common.js'

loger.logCustomInfo('Date format: year-month-date', false)
loger.logCustomInfo('Time format: hour-minute-second', false)

const server = express() 

export default server

server.use(cors())
server.use(express.json())

connectMongoDB()
connectServer()

server.post('/common/user/edit', upload.any(), common.editUserData)
server.get('/common/get/statistic', common.websiteStatistic)

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
server.post('/product/pagination/filter', product.productPaginationFilter)  
