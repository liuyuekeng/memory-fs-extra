'use strict'

const fromCallback = require('universalify').fromCallback

function remove(p, callback) {
  let fs = this;
  let res;
  try {
    res = fs.removeSync(p);
  } catch (e) {
    setImmediate(function () {
      callback && callback(e)
    });
    return;
  }
  setImmediate(function () {
    callback && callback(null, res);
  })
}

function removeSync(p) {
  let fs = this;
  let stats
  try {
    stats = fs.statSync(p)
  } catch (e) {
    if (e.code === 'ENOENT') {
      return null;
    }
  }
  if (stats.isFile()) {
    fs.unlinkSync(p)
  } else if (stats.isDirectory()) {
    fs.rmdirSync(p)
  }
}

module.exports = {
  remove: fromCallback(remove),
  removeSync
}
