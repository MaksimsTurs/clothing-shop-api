import express from 'express'
import cors from 'cors'
import multer from 'multer'
import { config } from 'dotenv'

import connectServer from './src/config/connectServer.js'
import cloudinaryConf from './src/config/cloudinarySetup.js'

import user from './src/controller/user.js'

console.clear()

export const server = express()

server.use(cors())
server.use(express.json())

const storage = multer.diskStorage({ filename: (req, file, cb) => { cb(null, `${Date.now()}${file.originalname}`) } })
const upload = multer({ storage })

config()
connectServer()
cloudinaryConf()

server.get('/', (req, res) => res.status(200).send({ message: 'SUCCES' }))
// server.post("/user/registration", upload.any(), user.registration)