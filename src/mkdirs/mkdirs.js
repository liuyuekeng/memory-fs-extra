'use strict'
const fromCallback = require('universalify').fromCallback

const mkdirs = fromCallback(function mkdirs(...arg) {
  let fs = this;
  return fs.mkdirp(...arg)
})

module.exports = mkdirs