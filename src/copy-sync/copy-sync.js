'use strict'

// TODO: enable this once graceful-fs supports bigint option.
// const fs = require('graceful-fs')
const path = require('path')
const stat = require('../util/stat')

function copySync (src, dest, opts) {
  let fs = this;
  if (typeof opts === 'function') {
    opts = { filter: opts }
  }

  opts = opts || {}
  opts.clobber = 'clobber' in opts ? !!opts.clobber : true // default to true for now
  opts.overwrite = 'overwrite' in opts ? !!opts.overwrite : opts.clobber // overwrite falls back to clobber

  // Warn about using preserveTimestamps on 32-bit node
  if (opts.preserveTimestamps && process.arch === 'ia32') {
    console.warn(`fs-extra: Using the preserveTimestamps option in 32-bit node is not recommended;\n
    see https://github.com/jprichardson/node-fs-extra/issues/269`)
  }

  const { destStat } = stat.checkPathsSync(fs, src, dest, 'copy')
  stat.checkParentPathsSync(fs, src, dest, 'copy')
  return handleFilterAndCopy(fs, destStat, src, dest, opts)
}

function handleFilterAndCopy (fs, destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  const destParent = path.dirname(dest)
  if (!fs.existsSync(destParent)) fs.mkdirpSync(destParent)
  return startCopy(fs, destStat, src, dest, opts)
}

function startCopy (fs, destStat, src, dest, opts) {
  if (opts.filter && !opts.filter(src, dest)) return
  return getStats(fs, destStat, src, dest, opts)
}

function getStats (fs, destStat, src, dest, opts) {
  const srcStat = fs.statSync(src)

  if (srcStat.isDirectory()) return onDir(fs, destStat, src, dest, opts)
  else if (srcStat.isFile() ||
           srcStat.isCharacterDevice() ||
           srcStat.isBlockDevice()) return onFile(fs, destStat, src, dest, opts)
}

function onFile (fs, destStat, src, dest, opts) {
  if (!destStat) return copyFile(fs, src, dest)
  return mayCopyFile(fs, src, dest, opts)
}

function mayCopyFile (fs, src, dest, opts) {
  if (opts.overwrite) {
    fs.unlinkSync(dest)
    return copyFile(fs, src, dest);
  } else if (opts.errorOnExist) {
    throw new Error(`'${dest}' already exists`)
  }
}

function copyFile (fs, src, dest) {
    fs.writeFileSync(dest, fs.readFileSync(src));
}

function onDir (fs, destStat, src, dest, opts) {
  if (!destStat) return mkDirAndCopy(fs, src, dest, opts)
  if (destStat && !destStat.isDirectory()) {
    throw new Error(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
  }
  return copyDir(fs, src, dest, opts)
}

function mkDirAndCopy (fs, src, dest, opts) {
  fs.mkdirSync(dest)
  return copyDir(fs, src, dest, opts)
}

function copyDir (fs, src, dest, opts) {
  fs.readdirSync(src).forEach(item => copyDirItem(fs, item, src, dest, opts))
}

function copyDirItem (fs, item, src, dest, opts) {
  const srcItem = path.join(src, item)
  const destItem = path.join(dest, item)
  const { destStat } = stat.checkPathsSync(fs, srcItem, destItem, 'copy')
  return startCopy(fs, destStat, srcItem, destItem, opts)
}

module.exports = copySync
