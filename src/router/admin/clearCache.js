import { cache } from '../../../index.js'

import { RESPONSE_200 } from '../../constants/succes-constans.js'

export default async function clearCache() {
  try {
    const keys = Object.keys(cache._storage)
    const cacheKeys = Object.values(cache.keys)

    for(let index = 0; index < keys.length; index++) {
      for(let kindex = 0; kindex < cacheKeys.length; kindex++) {
        if(!RegExp(cacheKeys[kindex]).test(keys[index])) cache.set(keys[index], undefined)
      }
    }

    return RESPONSE_200("Successfuly remove cache!")
  } catch(error) {
    throw new Error(error.message)
  }
}