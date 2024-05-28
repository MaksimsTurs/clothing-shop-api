import isAuth from "../../util/isAuth.js";

export default async function authorizate(req ) {
  const authResponse = await isAuth(req.get('Authorization').replace('Bearer', '').trim())

  if(authResponse.code !== 200) return authResponse

  return { name: `${authResponse.firstName} ${authResponse.secondName}`, id: authResponse._id, avatar: authResponse.avatar }  
}