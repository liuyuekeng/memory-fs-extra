'use strict'

const fromCallback = require('universalify').fromCallback
const path = require('path')

function outputFile (file, data, encoding, callback) {
  if (typeof encoding === 'function') {
    callback = encoding
    encoding = 'utf8'
  }

  let fs = this
  let res
  try {
    res = fs.outputFileSync(file, data, encoding)
  } catch (e) {
    setImmediate(function () {
      callback(e)
    })
    return
  }
  setImmediate(function () {
    callback(null, res);
  })
}

function outputFileSync (file, ...args) {
  const fs = this;
  const dir = path.dirname(file)
  if (fs.existsSync(dir)) {
    return fs.writeFileSync(file, ...args)
  }
  fs.mkdirpSync(dir)
  fs.writeFileSync(file, ...args)
}

module.exports = {
  outputFile: fromCallback(outputFile),
  outputFileSync
}
