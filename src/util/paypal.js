import paypalSDK from '@paypal/checkout-server-sdk'

function configureEnviroment() {
  const clientID = process.env.PAYPAL_CLIENT
  const clientSecret = process.env.PAYPAL_SECRET

  return process.env.NODE_ENV.trim() === 'dev' ? new paypalSDK.core.SandboxEnvironment(clientID, clientSecret) : new paypalSDK.core.LiveEnvironment(clientID, clientSecret) 
}

export default function createPaypalClient() {
  return new paypalSDK.core.PayPalHttpClient(configureEnviroment())
}