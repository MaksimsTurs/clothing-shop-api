import Loger from "../util/loger/loger.js"

import { RESPONSE_500, RESPONSE_504 } from '../constants/error-constans.js'

const routesHandler = {
  apply: async function(target, _, argArray) {
    const timer = new Loger.create.Timer()
    const req = argArray[0]
    const res = argArray[1]

    try {
      Loger.request(req.originalUrl, req.body, req.params)
  
      timer.start('Start executing route function')
      const targetResponse = await Promise.race([target(...argArray), maxEcutionTime(8000)])
      timer.stop(`Route function executed successfuly, ${JSON.stringify(targetResponse || '').length} byte data sended`)

      if(('code' in targetResponse) && ('message' in targetResponse)) {
        const { code, message } = targetResponse
        res.status(code).send({ code, message })
        Loger.response({ code, message })
      } else {
        res.status(200).send(targetResponse)
        Loger.response(targetResponse)
      }
    } catch(error) {
      res.status(500).send(RESPONSE_500('Something went wrong!'))
      Loger.error(error, import.meta.url)
    }
  }
}

async function maxEcutionTime(ms) {
  return new Promise((resolve) => setTimeout(() => resolve(RESPONSE_504()), ms))
}

export default function proxifier(callbacks) {
  let proxyfiedCallbacks = {}
  for(let index = 0; index < callbacks.length; index++) proxyfiedCallbacks[callbacks[index].name] = new Proxy(callbacks[index], routesHandler)
  return proxyfiedCallbacks
}