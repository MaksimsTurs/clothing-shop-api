import { getFromCache, inCache, pushInCache } from "../util/cache.js"

export default async function findMany(option) {
  const { model, cacheKey, condition } = option

  let data = undefined

  if(cacheKey && inCache(cacheKey)) return data = getFromCache(cacheKey)

  try {
    data = await model.find(condition)
    // pushInCache(data, cacheKey)

    return data
  } catch(error) {
    throw new Error(error)
  }
}