export default function isUndefinedOrNull(some) {
  if(some === 'undefined' || some === 'null' || typeof some === 'undefined') return true
  return false
}
