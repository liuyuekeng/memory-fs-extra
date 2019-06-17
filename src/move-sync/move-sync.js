'use strict'

// TODO: enable this once graceful-fs supports bigint option.
// const fs = require('graceful-fs')
const stat = require('../util/stat')
const path = require('path')

function moveSync (src, dest, opts) {
  let fs = this;
  opts = opts || {}
  const overwrite = opts.overwrite || opts.clobber || false

  stat.checkPathsSync(fs, src, dest, 'move')
  stat.checkParentPathsSync(fs, src, dest, 'move')
  fs.mkdirpSync(path.dirname(dest))
  return doRename(fs, src, dest, overwrite)
}

function doRename (fs, src, dest, overwrite) {
  if (overwrite) {
    fs.removeSync(dest)
    return rename(fs, src, dest, overwrite)
  }
  if (fs.existsSync(dest)) throw new Error('dest already exists.')
  return rename(fs, src, dest, overwrite)
}

function rename (fs, src, dest, overwrite) {
  const opts = {
    overwrite,
    errorOnExist: true
  }
  fs.copySync(src, dest, opts)
  return fs.removeSync(src)
}

module.exports = moveSync