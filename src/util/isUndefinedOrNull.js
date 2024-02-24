export default function isUndefinedOrNull(propertie) {
  if(!propertie) {
    return true
  } else if(propertie === 'undefined') {
    return true
  } else if(propertie === JSON.parse('null')) {
    return true
  } else if(typeof propertie === 'string' && propertie.length === 0) {
    return true
  } else {
    return false
  }
}