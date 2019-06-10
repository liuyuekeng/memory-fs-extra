'use strict'

const fromCallback = require('universalify').fromCallback

const emptyDir = fromCallback(function emptyDir (dir, callback){
  let fs = this
  let res;
  try {
    res = fs.emptyDirSync(dir)
  } catch (e) {
    setImmediate(function () {
      callback(e)
    })
    return
  }
  setImmediate(function () {
    callback(null, res);
  })
})

function emptyDirSync (dir) {
  let fs = this
  try {
    fs.readdirSync(dir)
  } catch (err) {
    return fs.mkdirpSync(dir)
  }

  fs.rmdirSync(dir);
  fs.mkdirSync(dir);
}

module.exports = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
}
