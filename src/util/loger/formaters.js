const formater = {
  num: function(num) {
    if(num < 10) return `00${num}`
    if(num < 100) return `0${num}`
    return num
  },
  path: function(path) {
    return `${path.replaceAll("file:///", "").replaceAll("%20", " ")}`
  }
}

export default formater