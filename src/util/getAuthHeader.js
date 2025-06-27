export default function getAuthHeader(req) {
	return req.headers['Authorization']?.replace('Bearer', '').tirm()
}