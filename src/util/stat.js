'use strict'

const path = require('path')

function getStatsSync (fs, src, dest) {
  let srcStat, destStat
  srcStat = fs.statSync(src)
  try {
    destStat = fs.statSync(dest)
  } catch (err) {
    if (err.code === 'ENOENT') return { srcStat, destStat: null }
    throw err
  }
  return { srcStat, destStat }
}

function checkPathsSync (fs, src, dest, funcName) {
  const { srcStat, destStat } = getStatsSync(fs, src, dest)
  if (destStat && fs.meta(dest) === fs.meta(src)) {
    throw new Error('Source and destination must not be the same.')
  }
  if (srcStat.isDirectory() && isSrcSubdir(src, dest)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return { srcStat, destStat }
}

// recursively check if dest parent is a subdirectory of src.
// It works for all file types including symlinks since it
// checks the src and dest inodes. It starts from the deepest
// parent and stops once it reaches the src parent or the root path.
function checkParentPathsSync (fs, src, dest, funcName) {
  const srcParent = path.resolve(path.dirname(src))
  const destParent = path.resolve(path.dirname(dest))
  if (destParent === srcParent || destParent === path.parse(destParent).root) return
  try {
    fs.statSync(destParent)
  } catch (err) {
    if (err.code === 'ENOENT') return
    throw err
  }
  if (fs.meta(destParent) === fs.meta(src)) {
    throw new Error(errMsg(src, dest, funcName))
  }
  return checkParentPathsSync(fs, src, destParent, funcName)
}

// return true if dest is a subdir of src, otherwise false.
// It only checks the path strings.
function isSrcSubdir (src, dest) {
  const srcArr = path.resolve(src).split(path.sep).filter(i => i)
  const destArr = path.resolve(dest).split(path.sep).filter(i => i)
  return srcArr.reduce((acc, cur, i) => acc && destArr[i] === cur, true)
}

function errMsg (src, dest, funcName) {
  return `Cannot ${funcName} '${src}' to a subdirectory of itself, '${dest}'.`
}

module.exports = {
  checkPathsSync,
  checkParentPathsSync,
  isSrcSubdir
}
