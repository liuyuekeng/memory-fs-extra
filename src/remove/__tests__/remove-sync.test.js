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

  it('should delete an empty directory', () => {
    expect(fs.existsSync(TEST_DIR)).toEqual(true)
    fs.removeSync(TEST_DIR)
    expect(fs.existsSync(TEST_DIR)).toEqual(false)
  })

  it('should delete a directory full of directories and files', () => {
    buildFixtureDir()
    expect(fs.existsSync(TEST_DIR)).toEqual(true)
    fs.removeSync(TEST_DIR)
    expect(fs.existsSync(TEST_DIR)).toEqual(false)
  })

  it('should delete a file', () => {
    const file = path.join(TEST_DIR, 'file')
    fs.writeFileSync(file, 'hello')

    expect(fs.existsSync(file))
    fs.removeSync(file)
    expect(fs.existsSync(file)).toEqual(false)
  })

  it('shouldn’t delete glob matches', () => {
    const file = path.join(TEST_DIR, 'file?')
    fs.writeFileSync(file, 'hello')
    const wrongFile = path.join(TEST_DIR, 'file1')
    fs.writeFileSync(wrongFile, 'yo')

    expect(fs.existsSync(file))
    expect(fs.existsSync(wrongFile))
    fs.removeSync(file)
    expect(fs.existsSync(file)).toEqual(false)
    expect(fs.existsSync(wrongFile)).toEqual(true)
  })

  it('shouldn’t delete glob matches when file doesn’t exist', () => {
    const nonexistentFile = path.join(TEST_DIR, 'file?')

    const wrongFile = path.join(TEST_DIR, 'file1')
    fs.writeFileSync(wrongFile, 'yo')

    expect(fs.existsSync(nonexistentFile)).toEqual(false)
    expect(fs.existsSync(wrongFile)).toEqual(true)
    fs.removeSync(nonexistentFile)
    expect(fs.existsSync(nonexistentFile)).toEqual(false)
    expect(fs.existsSync(wrongFile)).toEqual(true)
  })

  it('should not throw an error when dir dose not exist', () => {
    const someDir = path.join(TEST_DIR, 'some-dir/')
    expect(fs.existsSync(someDir)).toEqual(false)
    expect(() => {
        fs.removeSync(someDir)
    }).not.toThrow()
  })
})
