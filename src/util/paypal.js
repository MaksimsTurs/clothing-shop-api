import paypalSDK from '@paypal/checkout-server-sdk'

function configureEnviroment() {
  const mode = process.env.NODE_ENV.trim()
  const clientID = mode === 'dev' ? process.env.PAYPAL_CLIENT_SANDBOX : process.env.PAYPAL_CLIENT_LIVE
  const clientSecret = mode === 'dev' ? process.env.PAYPAL_SECRET_SANDBOX : process.env.PAYPAL_SECRET_LIVE

  return mode === 'dev' ? new paypalSDK.core.SandboxEnvironment(clientID, clientSecret) : new paypalSDK.core.LiveEnvironment(clientID, clientSecret) 
}

export default function createPaypalClient() {
  return new paypalSDK.core.PayPalHttpClient(configureEnviroment())
}