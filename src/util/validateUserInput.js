import loger from "./loger.js"

export default function validateUserData(object) {
  const { firstName, secondName, password, email, confirmPassword } = object

  return {
    validateFirstName: () => {
      if(firstName.length > 15 || firstName.length === 0) {
        loger.logValidationError([
          `firstName.length > 15 => ${firstName.length > 15} or`,
          `firstName.length === 0 => ${firstName.length === 0}`
        ])
        return false
      } else {
        return true
      }
    },
    validateSecondName: () => {
      if(secondName.length > 15 || secondName.length === 0) {
        loger.logValidationError([
          `secondName.length > 15 => ${secondName.length > 15} or`,
          `secondName.length === 0 => ${secondName.length === 0}`
        ])
        return false
      } else {
        return true
      }
    },
    validatePassword: () => {
      if(password.length < 8 || password.length === 0 || confirmPassword !== password) {
        loger.logValidationError([
          `password.length < 8 => ${password.length < 8} or`,
          `password.length === 0 => ${password.length === 0} or`,
          `password !== confirmPassword => ${confirmPassword !== password}`
        ])
        return false
      } else {
        return true
      }
    },
    validateConfirmPassword: () => {
      if(confirmPassword.length < 8 || confirmPassword.length === 0 || confirmPassword !== password) {
        loger.logValidationError([
          `confirmPassword.length < 8 => ${confirmPassword.length < 8} or`,
          `confirmPassword.length === 0 => ${confirmPassword.length === 0} or`,
          `confirmPassword !== password => ${confirmPassword !== password}`
        ])
        return false
      } else { 
        return true
      }
    },
    validateEmail: () => {
      const validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/

      if(email && email.match(validRegex).length === 0) {
        loger.logValidationError([`email.match(validRegex) => ${email.match(/^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)}`])
        return false
      } else { 
        return true
      }
    },
  }
}