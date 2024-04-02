import chalk from "chalk";

const loger = {
  logs: {},
  getDate: function() {
    const currDate = new Date()

    const milliSeconds = currDate.getMilliseconds()
    const second = currDate.getSeconds()
    const minutes = currDate.getMinutes()
    const hours = currDate.getHours()
    const date = currDate.getDate()
    const month = currDate.getMonth() + 1
    const year = currDate.getFullYear()
  
    return `${year}-${this.formatNum(month)}-${this.formatNum(date)} ${this.formatNum(hours)}:${this.formatNum(minutes)}:${this.formatNum(second)}:${this.formatNum(milliSeconds)}`  
  },
  formatNum: function(num) {
    if(num < 10) return `0${num}`
    return num
  },
  formatPath: function(path) {
    return `${path.replaceAll("file:///", "").replaceAll("%20", " ")}`
  },
  request(path, body, params) {
    console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} request on ${path}`)

    if(Object.keys(body).length > 0) console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} request body`, body)
    if(Object.keys(params).length > 0) console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} request params`, params)
  },
  response(data) {
    console.log(`${chalk.blue(`[SERVER RESPONSE ${this.getDate()}]:`)} response`, data)
  },
  error(error, file, message = undefined) {
    console.error(`${chalk.redBright(`[SERVER ERROR ${this.getDate()}]:`)} Error occured in ${file}, ${error.message}!`)
    if(message) console.error(`${chalk.redBright(`[SERVER ERROR ${this.getDate()}]:`)} ${message}`)
  },
/*------------------------------------------------------------------------------------------------------------------------------------------------------*/
  logRequest: function(protocol, host, url, body, params) {
    console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} request on ${new URL(protocol + '://' + host + url).href}`)
    // this.logs[`[SERVER REQUEST ${this.getDate()}]:`] = { text: `request on ${new URL(protocol + '://' + host + url).href}` }

    if(body) {
      console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} request body`, body)
      // this.logs[`[SERVER REQUEST ${this.getDate()}]:`] = { text: 'request body', data: body }
    }
    if(params) {
      console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} request params`, params)
      // this.logs[`[SERVER REQUEST ${this.getDate()}]:`] = { text: 'request params', data: params }
    }

  },
  logResponse: function(data) {
    console.log(`${chalk.blue(`[SERVER RESPONSE ${this.getDate()}]:`)} response`, data)
  },
  logCustomText: function(message, useDate) {
    if(useDate) console.log(`${chalk.blue(`[SERVER INFO ${this.getDate()}]:`)} ${message}`)
    if(!useDate) console.log(`${chalk.blue(`[SERVER INFO]:`)} ${message}`)
  },
  logError: function(error, path, line) {
    console.error(`${chalk.redBright(`[SERVER ERROR ${this.getDate()}]:`)} ${error.message}!`)
    console.error(`${chalk.redBright(`[SERVER ERROR ${this.getDate()}]:`)} Error occured in file ${this.formatPath(path)} on line ${line}`)
  },
  logValidationError: function(expressions) {
    console.log(`${chalk.redBright(`[SERVER VALIDATION ERROR ${this.getDate()}]:`)} validate failed!`)
    expressions.map(expression => console.log(`${chalk.redBright(`[SERVER VALIDATION ERROR ${this.getDate()}]:`)} ${expression}`))
  }
}

export default loger