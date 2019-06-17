'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index')
const randomBytes = require('crypto').randomBytes
const fs = new MemoryFsExtra()

/* global afterEach, beforeEach, describe, it */

let TEST_DIR

function buildFixtureDir () {
  const buf = randomBytes(5)
  const baseDir = path.join(TEST_DIR, `TEST_fs-extra_remove-${Date.now()}`)

  fs.mkdirSync(baseDir)
  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)
  fs.writeFileSync(path.join(baseDir, Math.random() + ''), buf)

  const subDir = path.join(TEST_DIR, Math.random() + '')
  fs.mkdirSync(subDir)
  fs.writeFileSync(path.join(subDir, Math.random() + ''), buf)
  return baseDir
}

describe('remove', () => {

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'output')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.removeSync(TEST_DIR))

  it('should delete an empty directory', done => {
    expect(fs.existsSync(TEST_DIR)).toEqual(true)
    fs.remove(TEST_DIR, err => {
      expect(!err).toEqual(true)
      expect(fs.existsSync(TEST_DIR)).toEqual(false)
      done()
    })
  })

  it('should delete a directory full of directories and files', done => {
    buildFixtureDir()
    expect(fs.existsSync(TEST_DIR)).toEqual(true)
    fs.remove(TEST_DIR, err => {
      expect(!err).toEqual(true)
      expect(fs.existsSync(TEST_DIR)).toEqual(false)
      done()
    })
  })

  it('should delete a file', done => {
    const file = path.join(TEST_DIR, 'file')
    fs.writeFileSync(file, 'hello')

    expect(fs.existsSync(file))
    fs.remove(file, err => {
      expect(!err).toEqual(true)
      expect(fs.existsSync(file)).toEqual(false)
      done()
    })
  })

  it('should delete without a callback', done => {
    const file = path.join(TEST_DIR, 'file')
    fs.writeFileSync(file, 'hello')

    expect(fs.existsSync(file)).toEqual(true)
    fs.remove(file)
    setTimeout(() => {
      expect(fs.existsSync(file)).toEqual(false)
      done()
    }, 25)
  })

  it('shouldn’t delete glob matches', function (done) {
    const file = path.join(TEST_DIR, 'file?')
    fs.writeFileSync(file, 'hello')
    const wrongFile = path.join(TEST_DIR, 'file1')
    fs.writeFileSync(wrongFile, 'yo')

    expect(fs.existsSync(file))
    expect(fs.existsSync(wrongFile))
    fs.remove(file, err => {
      expect(!err).toEqual(true)
      expect(fs.existsSync(file)).toEqual(false)
      expect(fs.existsSync(wrongFile)).toEqual(true)
      done()
    })
  })

  it('shouldn’t delete glob matches when file doesn’t exist', done => {
    const nonexistentFile = path.join(TEST_DIR, 'file?')

    const wrongFile = path.join(TEST_DIR, 'file1')
    fs.writeFileSync(wrongFile, 'yo')

    expect(fs.existsSync(nonexistentFile)).toEqual(false)
    expect(fs.existsSync(wrongFile)).toEqual(true)
    fs.remove(nonexistentFile, err => {
      expect(!err).toEqual(true)
      expect(fs.existsSync(nonexistentFile)).toEqual(false)
      expect(fs.existsSync(wrongFile)).toEqual(true)
      done()
    })
  })

  it('should not throw an error when dir dose not exist', done => {
    const someDir = path.join(TEST_DIR, 'some-dir/')
    expect(fs.existsSync(someDir)).toEqual(false)
    fs.remove(someDir, err => {
      expect(!err).toEqual(true)
      done()
    })
  })
})
