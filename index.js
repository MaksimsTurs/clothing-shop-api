import express from 'express'
import cors from 'cors'
import bodyParser from 'body-parser'
import { config } from 'dotenv'

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

export const server = express()

server.use(cors())
server.use(bodyParser.json())
server.use(bodyParser.urlencoded({ extended: true }))

config()
connectMongoDB()
connectServer()

server.post('/common/user/edit', upload.any(), common.editUserData)

server.get('/admin/check/:token', admin.controllUser)
server.get('/admin/store/get/all', admin.getStoreData)
server.post('/admin/product/add', upload.any(), admin.addProduct)
server.post('/admin/product/edit', upload.any(), admin.editProduct)
server.post('/admin/product-section/add', admin.addSection)

server.get('/user/:token', user.getUserByToken)
server.post("/user/registration", upload.any(), user.registration)
server.post("/user/login", user.login)

server.get('/product/get/all', product.getAllProducts)
server.get('/product/get/by-id/:id/', product.getProductByID)
server.post('/product/pagination/filter/:page', product.productPaginationFilter)