import chalk from "chalk";

const loger = {
  getDate: function() {
    const currDate = new Date()

    const second = currDate.getSeconds()
    const minutes = currDate.getMinutes()
    const hours = currDate.getHours()
    const date = currDate.getDate()
    const month = currDate.getMonth() + 1
    const year = currDate.getFullYear()
  
    return `${year}-${this.formatNum(month)}-${this.formatNum(date)} ${this.formatNum(hours)}:${this.formatNum(minutes)}:${this.formatNum(second)}`  
  },
  formatNum: function(num) {
    if(num < 10) return `0${num}`
    return num
  },
  formatPath: function(path) {
    return `${path.replaceAll("file:///", "").replaceAll("%20", " ")}`
  },
  logRequest: function(protocol, host, url, body, params) {
    console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} Request on ${new URL(protocol + '://' + host + url).href}`)
    if(body) console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} Request body`, body)
    if(params) console.log(`${chalk.greenBright(`[SERVER REQUEST ${this.getDate()}]:`)} Request params`, params)
  },
  logResponse: function(data) {
    console.log(`${chalk.blue(`[SERVER RESPONSE ${this.getDate()}]:`)} Response`, data)
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
    console.log(`${chalk.redBright(`[SERVER VALIDATION ERROR ${this.getDate()}]:`)} Validate failed!`)
    expressions.map(expression => console.log(`${chalk.redBright(`[SERVER VALIDATION ERROR ${this.getDate()}]:`)} ${expression}`))
  }
}

export default loger