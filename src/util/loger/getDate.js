import formater from "./formaters.js"

export default function getDate() {
  const currDate = new Date()

  const month = formater.num(currDate.getMonth() + 1)
  const date = formater.num(currDate.getDate())
  const hours = formater.num(currDate.getHours())
  const minutes = formater.num(currDate.getMinutes())
  const second = formater.num(currDate.getSeconds())
  const milliSeconds = formater.num(currDate.getMilliseconds())

  return `${month}-${date} ${hours}:${minutes}:${second}:${milliSeconds}`  
}