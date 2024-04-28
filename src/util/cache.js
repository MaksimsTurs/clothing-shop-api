export default function CreateCache({ cacheKeys }) {
  this._storage = {}
  this.keys = cacheKeys

  this.get = function get(key) {
    return this._storage[key]
  }

  this.set = function set(key, value) {
    this._storage[key] = value
  }

  this.remove = function remove(key) {
    delete this._storage[key]
  }
  
  this.restore = function restore() {
    this._storage = {}
  }
}