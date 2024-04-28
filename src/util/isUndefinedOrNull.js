export default function isUndefinedOrNull(what) {
  if(!what || what === 'undefined' || what === 'null' || (typeof what === 'string' && what.length === 0)) return true
  return false
}
