import chalk from "chalk"

import getDate from "./getDate.js"

export default function createLabel(level = 'INFO') {
  switch(level) {
    case 'REQUEST':
    case 'RESPONSE':
    case 'INFO':
      return `${chalk.blueBright(`[SERVER ${level} ${getDate()}]:`)}`
    case 'ERROR':
      return `${chalk.redBright(`[SERVER ${level} ${getDate()}]:`)}`
  }
}