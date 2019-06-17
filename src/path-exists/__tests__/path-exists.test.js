'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index')
const fs = new MemoryFsExtra()

describe('pathExists', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'path-exists-sync')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.remove(TEST_DIR))

  it('should return false if file does not exist', () => {
    return fs.pathExists(path.join(TEST_DIR, 'somefile'))
      .then(exists => expect(exists).toEqual(false))
  })

  it('should return true if file does exist', () => {
    const file = path.join(TEST_DIR, 'exists')
    fs.ensureFileSync(file)
    return fs.pathExists(file)
      .then(exists => expect(exists).toEqual(true))
  })

  it('should pass an empty error parameter to the callback', done => {
    const file = path.join(TEST_DIR, 'exists')
    fs.ensureFileSync(file)
    fs.pathExists(file, (err, exists) => {
      expect(!err).toEqual(true)
      expect(exists).toEqual(true)
      done()
    })
  })
})
