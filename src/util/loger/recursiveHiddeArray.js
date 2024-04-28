export default function recursiveHiddeArray(response) {
  for(let [key, value] of Object.entries(response)) {
    if(Array.isArray(value) && value.length > 0) response[key] = '[Array]'
    else if(typeof value === 'object') recursiveHiddeArray(value)
  }
}