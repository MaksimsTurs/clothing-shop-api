export default function CreateCache({ cacheKeys, isDisable }) {
  this._storage = {}
  this.isDisable = isDisable ?? false
  this.keys = cacheKeys

  this.get = function get(key) {
    if(this.isDisable) return
    return this._storage[key]
  }

  this.set = function set(key, value) {
    if(this.isDisable) return
    this._storage[key] = value
  }

  this.remove = function remove(key) {
    if(this.isDisable) return
    delete this._storage[key]
  }
  
  this.restore = function restore() {
    if(this.isDisable) return
    this._storage = {}
  }
}