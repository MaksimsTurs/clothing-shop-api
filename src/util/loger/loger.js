/**
 * blueBright()   for INFO/REQUEST/RESPONSE
 * redBright()    for ERROR/VALIDATION ERROR
 * yellowBright() for NUMBER
 */

import chalk from "chalk";

const Loger = {
  create: { Timer },
  request: function(url, body, params) {
    body = Object.keys(body || {}).length === 0 ? '[UNDEFINED]' : body
    params = Object.keys(params || {}).length === 0 ? '[UNDEFINED]' : params
    console.info(getLabel('REQUEST'), { url, body, params })
  },
  response: function(response, toRedicate) {
    const res = JSON.parse(JSON.stringify(response))
    hiddeArray(res)
    hiddeProp(res, toRedicate)
    console.info(getLabel('RESPONSE'), res)
  },
  error: function(message, fileName) {
    console.error(getLabel('ERROR'), { message, file: fileName })
  },
  log: function(text) {
    console.log(`${getLabel('INFO')} ${colorizer(`0ms ${text}`)}`)
  },
}

function Timer() {
  this.index = -1
  this.timers = []

  this.start = function() {
    this.timers.push(Date.now())
    this.index++
  }

  this.stop = function(text) {
    const deleteIndex = (this.index >= 1) ? this.timers.length - 1 : 0
    const time = (Date.now() - this.timers[deleteIndex])

    this.timers.pop()
    this.index--

    console.log(`${getLabel('INFO')} ${colorizer(`${time}ms ${text}`)}`)
  }
}

function colorizer(text) {
  let textSplited = text.split(' '), logText = ''
  for(let index = 0; index < textSplited.length; index++) {
    if(/\".+?\"/.test(textSplited[index])) logText += chalk.greenBright(`${textSplited[index]} `)
    else if(!Number.isNaN(parseFloat(textSplited[index]))) logText += `${chalk.yellowBright(textSplited[index])} `
    else logText += `${textSplited[index]} `
  }
  return logText
}

function hiddeProp(response, toRedicate) {
  if(toRedicate) for(let index = 0; index < toRedicate.length; index++) response[toRedicate[index]] = '[Hidden]'
}

function hiddeArray(response) {
  for(let [key, value] of Object.entries(response)) {
    if(Array.isArray(value) && value.length > 0) response[key] = '[Array]'
    else if(typeof value === 'object' && value) hiddeArray(value)
  }
}

function getLabel(level = 'INFO') {
  switch(level) {
    case 'INFO':
    case 'REQUEST':
    case 'RESPONSE':
      return chalk.blueBright(`[SERVER ${level} ${getDate()}]:`)
    case 'ERROR':
      return chalk.redBright(`[SERVER ${level} ${getDate()}]`)
  }
}

function formatNum(num) {
  if(num < 10) return `00${num}`
  else if(num < 100) return `0${num}`
  return num
}

function getDate() {
  const currDate = new Date()

  const month        = formatNum(currDate.getMonth() + 1)
  const date         = formatNum(currDate.getDate())
  const hours        = formatNum(currDate.getHours())
  const minutes      = formatNum(currDate.getMinutes())
  const second       = formatNum(currDate.getSeconds())
  const milliSeconds = formatNum(currDate.getMilliseconds())

  return `${month}-${date} ${hours}:${minutes}:${second}:${milliSeconds}`  
}

export default Loger