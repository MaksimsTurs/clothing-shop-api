import isUndefinedOrNull from "./isUndefinedOrNull.js"

const isDefined = {
  assign: function(body) {
    return {...this, body }
  },
  isEmptyString: function(string) {
    return string.length === 0
  },
  check: function(skip) {
    const entries = Object.entries(this.body)
    
    let object = {}

    for(let [key, value] of entries) {
      if(Array.isArray(value)) object = {...object, [key]: value }
      if(isUndefinedOrNull(value) || skip?.includes(key)) continue
      else if(typeof value === 'boolean') object = {...object, [key]: value }
      else if(value.length > 0) object = {...object, [key]: value }
    }

    return object
  }
}

export default isDefined