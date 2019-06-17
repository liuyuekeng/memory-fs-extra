'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index')
const fs = new MemoryFsExtra()

describe('pathExists', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'fs-extra', 'path-exists')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.removeSync(TEST_DIR))

  it('should return false if file does not exist', () => {
    expect(fs.pathExistsSync(path.join(TEST_DIR, 'somefile'))).toEqual(false)
  })

  it('should return true if file does exist', () => {
    const file = path.join(TEST_DIR, 'exists')
    fs.ensureFileSync(file)
    expect(fs.pathExistsSync(file)).toEqual(true)
  })
})
