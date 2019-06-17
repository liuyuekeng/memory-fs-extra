'use strict'
const fromCallback = require('universalify').fromCallback

const move = fromCallback(function move(src, dest, opts, cb) {
  if (typeof opts === 'function') {
    cb = opts
    opts = {}
  }

  let fs = this;
  let res;
  try {
    res = fs.moveSync(src, dest, opts);
  } catch (e) {
    setImmediate(() => {
      cb(e)
    })
    return
  }
  setImmediate(() => {
    cb(null, res)
  })
})

module.exports = move;