/**
 * blueBright()   for INFO/REQUEST/RESPONSE
 * redBright()    for ERROR/VALIDATION ERROR
 * yellowBright() for WARN
 */

import recursiveHiddeArray from "./recursiveHiddeArray.js";
import recursiveHiddeProperty from './recursiveHiddeProperty.js'
import formater from "./formaters.js";
import createLabel from "./createLabel.js";

import chalk from "chalk";

const Loger = {
  create: {
    Timer: function() {
      this.times = {}
      this.start = function(key) {
        this.times[key] = Date.now()
      }
      this.stop = function(text, key) {
        this.times[key] = (Date.now() - this.times[key]) / 1000
        console.log(`${createLabel('INFO')} ${chalk.greenBright(`[${chalk.yellowBright(`${chalk.yellowBright(`${this.times[key]}s`)}`)}]`)} ${text}`)
      }
    }
  },
  request: function(URL, _body, _params) {
    const body = Object.keys(_body || {}).length > 0 ? _body : 'Request body is not defined.'
    const params = Object.keys(_params || {}).length > 0 ? _params : 'Request params is not defined.' 
    console.info(createLabel('REQUEST'), { URL, body, params })
  },
  response: function(data, redicateKeys = undefined) {
    let response = JSON.parse(JSON.stringify(data))

    recursiveHiddeArray(response)
    recursiveHiddeProperty(response, redicateKeys)

    console.info(createLabel('RESPONSE'), response)
  },
  error: function(message, file, target) {
    console.error(createLabel('ERROR'), { occuredIn: formater.path(file), message, target })
  },
  text: function(message, data) {
    console.log(`${createLabel('INFO')} ${message}`, data ?? '')
  },
}

export default Loger