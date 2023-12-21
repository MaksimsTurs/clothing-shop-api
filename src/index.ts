// @deno-types="npm:@types/express@4"
import express, { Request, Response } from 'npm:express@4.18.2'

const server = express()

server.listen(4000)

server.get("/", (_req: Request, res: Response) => {
  res.status(200).send({ message: 'RESPONSE' })
})