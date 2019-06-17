'use strict'

function mkdirsSync(...arg) {
  let fs = this;
  return fs.mkdirpSync(...arg)
}

module.exports = mkdirsSync