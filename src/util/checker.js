import isUndefinedOrNull from "./isUndefinedOrNull.js"

const checker = {
  isNotEmpty: function(toCheck, toSkip) {
    if(typeof toCheck === 'string' && toCheck.length === 0) return false

    if(Array.isArray(toCheck) && toCheck.length === 0) return false

    if(typeof toCheck === 'object') {
      const entries = Object.entries(toCheck)

      let object = {}

      for(let [key, value] of entries) {
        if(toSkip?.includes(key) || isUndefinedOrNull(value)) continue
        else if(Array.isArray(value) && value.length > 0) object = {...object, [key]: value }
        else if(typeof value === 'string' && value.length > 0) object = {...object, [key]: value }
        else if(typeof value === 'boolean') object = {...object, [key]: value }
      }

      return object
    }

    return true
  },
  isUndefinedOrNull: function(toCheck) {
    if(toCheck === 'undefined' || toCheck === 'null' || typeof toCheck === 'undefined') return true
    return false
  }
}

export default checker