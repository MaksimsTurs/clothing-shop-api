import express from 'express'

const server = express()

server.listen(4000)

server.get('/', (req, res) => {
  return res.status(200).send({ message: 'Hello World!' })
})