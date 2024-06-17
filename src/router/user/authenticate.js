import isAuth from "../../util/isAuth.js";
import isNewUser from '../../util/isNewUser.js'
import getAuthHeader from '../../util/getAuthHeader.js'

export default async function authenticate(req) {
  const authResponse = await isAuth(getAuthHeader(req))

  if(authResponse.code !== 200) return authResponse

  return { name: `${authResponse.firstName} ${authResponse.secondName}`, id: authResponse._id, avatar: authResponse.avatar, isNew: isNewUser(authResponse.createdAt) }  
}