import Loger from "./loger/loger.js"

const MODE = process.env.NODE_ENV.trim()
const CLIENT_ID = MODE === 'dev' ? process.env.PAYPAL_CLIENT_SANDBOX : process.env.PAYPAL_CLIENT_LIVE
const SECRET = MODE === 'dev' ? process.env.PAYPAL_SECRET_SANDBOX : process.env.PAYPAL_SECRET_LIVE
const BASE_PAYPAL_URL = MODE === 'dev' ? 'https://api-m.sandbox.paypal.com' : 'https://api-m.paypal.com'

const paypal = {
  auth: async function() {
    Loger.log(`Use "${process.env.NODE_ENV.trim()}" enviroment`)
    Loger.log(`Fetch URL "${BASE_PAYPAL_URL}"`)

    const base64 = Buffer.from(`${CLIENT_ID}:${SECRET}`).toString('base64')
    const response = await fetch(`${BASE_PAYPAL_URL}/v1/oauth2/token`, {
      method: 'POST',
      body: 'grant_type=client_credentials',
      headers: { 'Authorization': `Basic ${base64}` }
    })

    if(!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    const json = await response.json()
    return json
  },
  checkout: async function(token, currency_code, value) {
    Loger.log(`Use "${process.env.NODE_ENV.trim()}" enviroment`)
    Loger.log(`Fetch URL "${BASE_PAYPAL_URL}"`)

    const response = await fetch(`${BASE_PAYPAL_URL}/v2/checkout/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ intent: 'CAPTURE', purchase_units: [{ amount: { currency_code, value } }] })
    })

    if(!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    const json = await response.json()
    return json
  },
  caputre: async function(orderID, token) {
    Loger.log(`Use "${process.env.NODE_ENV.trim()}" enviroment`)
    Loger.log(`Fetch URL "${BASE_PAYPAL_URL}"`)

    const response = await fetch(`${BASE_PAYPAL_URL}/v2/checkout/orders/${orderID}/capture`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
    })

    if(!response.ok) {
      const error = await response.json()
      throw new Error(error.error)
    }

    const json = await response.json()
    return json
  }
}

export default paypal