import Loger from "../util/loger/loger.js"

const baseRouter = {
  apply: async function(target, _, argArray) {
    try {
      const timer = new Loger.create.Timer()
      const req = argArray[0]
      const res = argArray[1]
  
      Loger.request(req.originalUrl, req.body, req.params)
  
      timer.start('EXECUTION_TIME')
      const targetResponse = await target(...argArray)
      timer.stop('Complete executed', 'EXECUTION_TIME')
      
      if(('code' in targetResponse) && ('message' in targetResponse)) {
        const { code, message } = targetResponse
        res.status(code).send({ code, message })
        Loger.response({ code, message })
      } else {
        res.status(200).send(targetResponse)
        Loger.response(targetResponse)
      }
    } catch(error) {
      Loger.error(error.message, import.meta.url, target.name)
    }
  }
}

export default function proxifier(callbacks) {
  let proxyfiedCallbacks = {}

  for(let index = 0; index < callbacks.length; index++) proxyfiedCallbacks[callbacks[index].name] = new Proxy(callbacks[index], baseRouter)
  
  return proxyfiedCallbacks
}