export default function getAuthHeader(req) {
  return req.get('Authorization').replace('Bearer', '').trim()
}