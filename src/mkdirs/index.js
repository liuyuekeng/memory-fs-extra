'use strict'
const mkdirs = require('./mkdirs')
const mkdirsSync = require('./mkdirs-sync')

module.exports = {
  mkdirs,
  mkdirsSync,
  // mkdirp: mkdirs,
  // mkdirpSync: mkdirsSync,
  ensureDir: mkdirs,
  ensureDirSync: mkdirsSync
}