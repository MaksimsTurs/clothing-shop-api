import chalk from "chalk";

const loger = {
  getLogTime: function() {
    const currDate = new Date()

    const second = currDate.getSeconds()
    const minutes = currDate.getMinutes()
    const hours = currDate.getHours()
    const date = currDate.getDate()
    const month = currDate.getMonth() + 1
    const year = currDate.getFullYear()

    return `Date ${year}-${this.formatTime(month)}-${this.formatTime(date)} Time ${this.formatTime(hours)}:${this.formatTime(minutes)}:${this.formatTime(second)}`
  },
  formatTime: function(time) {
    if(time < 10) return `0${time}`

    return time
  },
  URLFromImportMeta: function(path) {
    return `${path.replaceAll("file:///", "").replaceAll("%20", " ")}`
  },
  logURLRequest: function(protocol, host, url, body) {
    console.log(`${chalk.greenBright('[SERVER REQUEST]:')} Request on ${new URL(protocol + '://' + host + url).href}`)
    console.log(`${chalk.blue('[SERVER INFO]:')} ${this.getLogTime()}`)
    if(body) console.log(body)
  },
  logCustomInfo: function(message, logTime) {
    console.log(`${chalk.blue('[SERVER INFO]:')} ${message}`)
    if(logTime === undefined || logTime === true) console.log(`${chalk.blue('[SERVER INFO]:')} ${this.getLogTime()}`)
  },
  logCatchError: function(error, path, line) {
    console.error(`${chalk.redBright('[SERVER ERROR]:')} ${error.message}!`)
    console.error(`${chalk.redBright('[SERVER ERROR]:')} Error occured in file ${this.URLFromImportMeta(path)} on line ${line}`)
    console.log(`${chalk.blue('[SERVER INFO]:')} ${this.getLogTime()}`)
  },
  logValidationError: function(expressions) {
    console.log(`${chalk.redBright('[VALIDATION ERROR]:')} Validate failed!`)
    expressions.map(expression => console.log(`${chalk.redBright('[VALIDATION ERROR]:')} ${expression}`))
    console.log(`${chalk.blue('[SERVER INFO]:')} ${this.getLogTime()}`)
  },
  logResponseData: function(data) {
    console.log(`${chalk.blue('[SERVER INFO]:')} ${this.getLogTime()}`)
    console.log(`${chalk.blue('[SERVER INFO]:')} Response `, JSON.parse(JSON.stringify(data)))
  }
}

export default loger