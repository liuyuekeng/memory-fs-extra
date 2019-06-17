'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index')
const fs = new MemoryFsExtra()

/* global afterEach, beforeEach, describe, it */

describe('mkdirs', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'mkdirs')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.remove(TEST_DIR))

  it('should make the directory', done => {
    const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())

    expect(fs.existsSync(dir)).toEqual(false)

    fs.mkdirs(dir, err => {
      expect(!err).toEqual(true)
      expect(fs.existsSync(dir)).toEqual(true)
      done()
    })
  })

  it('should make the entire directory path', done => {
    const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
    const newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa')

    expect(fs.existsSync(dir)).toEqual(false)

    fs.mkdirs(newDir, err => {
      expect(!err).toEqual(true)
      expect(fs.existsSync(newDir)).toEqual(true)
      done()
    })
  })
})

describe('mkdirsSync', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'mkdirs-sync')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.remove(TEST_DIR))

  it('should make the directory', () => {
    const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())

    expect(fs.existsSync(dir)).toEqual(false)

    fs.mkdirsSync(dir)
    expect(fs.existsSync(dir)).toEqual(true)
  })

  it('should make the entire directory path', () => {
    const dir = path.join(TEST_DIR, 'tmp-' + Date.now() + Math.random())
    const newDir = path.join(TEST_DIR, 'dfdf', 'ffff', 'aaa')

    expect(fs.existsSync(dir)).toEqual(false)

    fs.mkdirsSync(newDir)
    expect(fs.existsSync(newDir)).toEqual(true)
  })
})