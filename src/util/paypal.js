import paypalSDK from '@paypal/checkout-server-sdk'

import Loger from './loger/loger.js'

function configureEnviroment() {
  const mode = process.env.NODE_ENV.trim()
  const clientID = mode === 'dev' ? process.env.PAYPAL_CLIENT_SANDBOX : process.env.PAYPAL_CLIENT_LIVE
  const clientSecret = mode === 'dev' ? process.env.PAYPAL_SECRET_SANDBOX : process.env.PAYPAL_SECRET_LIVE

  const enviroment = {
    type: mode === 'dev' ? 'sandbox' : 'live',
    env: mode === 'dev' ? new paypalSDK.core.SandboxEnvironment(clientID, clientSecret) : new paypalSDK.core.LiveEnvironment(clientID, clientSecret)
  }

  return enviroment
}

export default function createPaypalClient() {
  const enviroment = configureEnviroment()
  Loger.log(`Paypal enviroment type is ${enviroment.type}`)
  return new paypalSDK.core.PayPalHttpClient(enviroment.env)
}