'use strict'

const fromCallback = require('universalify').fromCallback

const copy = fromCallback(function copy(src, dest, opts, cb){
  /**
   * copy method did not allows
   * filter fn to return a promise!
   */
  if (typeof opts === 'function' && !cb) {
    cb = opts
    opts = {}
  } else if (typeof opts === 'function') {
    opts = { filter: opts }
  }
  
  cb = cb || function () {}
  opts = opts || {}

  let fs = this
  let res;
  try {
    res = fs.copySync(src, dest, opts)
  } catch (e) {
    setImmediate(function () {
      cb(e)
    })
    return
  }
  setImmediate(function () {
    cb(null, res);
  })
})

module.exports = {copy}