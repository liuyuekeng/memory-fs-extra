'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();
const stat = require('../stat');

/* global afterEach, beforeEach, describe, it */

describe('+ util/stat', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'util-stat')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> while src and dest is the same', () => {
    it('stat.checkPathsSync should throw error', () => {
      const src = path.join(TEST_DIR, 'src')
      const dest = src
      fs.writeFileSync(src, '123')
      expect(() => {
        stat.checkPathsSync(fs, src, dest, 'copy')
      }).toThrow()
    })
  });

  describe('> while dest is subdir of src', () => {
    let src
    let dest

    beforeEach(() => {
      src = path.join(TEST_DIR, 'src')
      dest = path.join(TEST_DIR, 'src', 'dest')
      fs.emptyDirSync(TEST_DIR)
      fs.mkdirSync(src)
      fs.mkdirSync(dest)
    })

    it('stat.checkPathsSync should throw error', () => {
      expect(() => {
        stat.checkPathsSync(fs, src, dest, 'copy')
      }).toThrow()
    })

    it('stat.checkParentPathsSync should throw error', () => {
        expect(() => {
          stat.checkParentPathsSync(fs, src, dest, 'copy')
        }).toThrow()
      })
    })

  describe('> while dest is not subdir of src', () => {
    let src
    let dest

    beforeEach(() => {
      src = path.join(TEST_DIR, 'src')
      dest = path.join(TEST_DIR, 'dest')
      fs.emptyDirSync(TEST_DIR)
      fs.mkdirSync(src)
      fs.mkdirSync(dest)
    })
    it('stat.checkPathsSync should not throw error', () => {
      stat.checkPathsSync(fs, src, dest, 'copy')
    })
    it('stat.checkParentPathsSync should not throw error', () => {
      stat.checkParentPathsSync(fs, src, dest, 'copy')
    })
  })
})
