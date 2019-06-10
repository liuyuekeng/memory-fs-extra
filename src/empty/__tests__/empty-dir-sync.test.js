'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ emptyDirSync()', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'empty-dir')
    if (fs.existsSync(TEST_DIR)) {
      fs.rmdirSync(TEST_DIR);
    }
    fs.mkdirpSync(TEST_DIR)
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when directory exists and contains items', () => {
    it('should delete all of the items', () => {
      // verify nothing
      expect(fs.readdirSync(TEST_DIR).length).toEqual(0)
      fs.writeFileSync(path.join(TEST_DIR, 'some-file'), 'some-file');
      fs.writeFileSync(path.join(TEST_DIR, 'some-file-2'), 'some-file-2');
      fs.mkdirSync(path.join(TEST_DIR, 'some-dir'));
      expect(fs.readdirSync(TEST_DIR).length).toEqual(3)
      fs.emptyDirSync(TEST_DIR);
      expect(fs.readdirSync(TEST_DIR).length).toEqual(0)
    })
  })

  describe('> when directory exists and contains no items', () => {
    it('should do nothing', () => {
      expect(fs.readdirSync(TEST_DIR).length).toEqual(0)
      fs.emptyDirSync(TEST_DIR);
      expect(fs.readdirSync(TEST_DIR).length).toEqual(0)
    })
  })

  describe('> when directory does not exist', () => {
    it('should create it', () => {
      fs.rmdirSync(TEST_DIR)
      expect(fs.existsSync(TEST_DIR)).toEqual(false);
      fs.emptyDirSync(TEST_DIR);
      expect(fs.readdirSync(TEST_DIR).length).toEqual(0)
    })
  })
})
