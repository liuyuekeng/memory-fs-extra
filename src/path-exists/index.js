'use strict'

const fromCallback = require('universalify').fromCallback

const pathExists = fromCallback(function pathExists(p, callback) {
  let fs = this
  let res
  try {
    res = fs.pathExistsSync(p)
  } catch (e) {
    setImmediate(() => {
      callback(e)
    })
    return
  }
  setImmediate(() => {
    callback(null, res)
  })
})

function pathExistsSync(...arg) {
  let fs = this;
  return fs.existsSync(...arg)
}

module.exports = {
  pathExists,
  pathExistsSync
}
