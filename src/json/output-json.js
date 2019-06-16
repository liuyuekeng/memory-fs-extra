'use strict'

const fromCallback = require('universalify').fromCallback
const path = require('path')

const outputJson = fromCallback(function outputJson (file, data, options, callback) {
  let fs = this;
  if (typeof options === 'function') {
    callback = options
    options = {}
  }
  let res
  try {
    res = fs.outputJsonSync(file, data, options);
  } catch (e) {
    setImmediate(function () {
      callback(e);
    });
    return;
  }
  setImmediate(function () {
    callback(null, res);
  })
});

function outputJsonSync (file, data, options) {
  let fs = this;
  const dir = path.dirname(file)

  if (!fs.existsSync(dir)) {
    fs.mkdirpSync(dir)
  }

  fs.writeJsonSync(file, data, options)
}

module.exports = {
    outputJsonSync,
    outputJson 
}
