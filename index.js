import express from 'express'
import cors from 'cors'

import setupServer from './src/config/setupServer.js'
import upload from './src/config/multer.js'

import user from './src/controller/user.js'
import product from './src/controller/product.js'
import admin from './src/controller/admin.js'
import loger from './src/util/loger.js'

import commonController from './src/controller/common.js'
import sectionController from './src/controller/section.js'

console.clear()
loger.logCustomText('Date format: year/month/date', false)
loger.logCustomText('Time format: hour/minute/second/milli-seconds', false)

const server = express() 

server.use(cors())
server.use(express.json())

export default server

await setupServer()

/*---------------------------------------------------------------------*/
server.get('/', commonController.getAll) //All for home page.

server.post('/common/user/edit', upload.any(), commonController.editUserData)

server.get('/section/delete', sectionController.deleteSectionByTitle)

server.get('/product/:id', product.getProductByID)
server.post('/product/filter-and-pagination', product.productPaginationFilter)

server.post("/user/login", user.login)
server.post("/user/registration", upload.any(), user.registration)
server.get('/user/:token', user.getUserByToken)
server.get('/user/delete/:token', user.deleteUser)

server.get('/admin/check/:token', admin.controllUser)
server.get('/admin/get/store', admin.getStoreData)
server.get('/admin/delete-item/:id/:from', admin.deleteItem)
server.post('/admin/product/edit', upload.any(), admin.editProduct)
server.post('/admin/product/add', upload.any(), admin.addProduct)
server.post('/admin/product-section/add', admin.addSection)
server.post('/admin/product-section/edit', admin.editProductsSection)
/*---------------------------------------------------------------------*/

server.post('/common/checkout', commonController.checkout)
server.post('/common/buy', commonController.buy)
