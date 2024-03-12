export const cache = {}

export function pushInCache(data, key = undefined) {
  if(!key) {
    const dataEntries = Object.entries(data)
    for(let index = 0; index < dataEntries.length; index++) cache[dataEntries[index][0]] = dataEntries[index][1]
  } else {
    cache[key] = data
  }
}

export function getFromCache(key) {
  return cache[key]
}

export function inCache(key) {
  return Boolean(cache[key])
}

export function invalidateCacheKey(key) {
  cache[key] = null
}

export function deleteCache(key) {
  delete cache[key]
}