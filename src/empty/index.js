'use strict'

const fromCallback = require('universalify').fromCallback
const path = require('path');

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
  let items;
  try {
    items = fs.readdirSync(dir)
  } catch (err) {
    return fs.mkdirpSync(dir)
  }

  items.forEach(item => {
    let toRm = path.join(dir, item)
    fs.removeSync(toRm);
  });
}

module.exports = {
  emptyDirSync,
  emptydirSync: emptyDirSync,
  emptyDir,
  emptydir: emptyDir
}
