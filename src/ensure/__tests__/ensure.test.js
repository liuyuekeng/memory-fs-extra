'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ ensureFile', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'ensure')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when file exists', () => {
    it('should not do anything', done => {
      const file = path.join(TEST_DIR, 'file.txt')
      fs.writeFileSync(file, 'blah')

      expect(fs.existsSync(file)).toEqual(true);
      fs.ensureFile(file, err => {
        expect(!err).toEqual(true);
        expect(fs.existsSync(file)).toEqual(true);
        expect(fs.readFileSync(file, 'utf8')).toEqual('blah');
        done()
      })
    })
  })

  describe('> when file does not exist', () => {
    it('should create the file', done => {
      const file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

      expect(fs.existsSync(file)).toEqual(false);
      fs.ensureFile(file, err => {
        expect(!err).toEqual(true)
        expect(fs.existsSync(file)).toEqual(true)
        done()
      })
    })
  })

  describe('> when there is a directory at that path', () => {
    it('should error', done => {
      const p = path.join(TEST_DIR, 'somedir')
      fs.mkdirSync(p)

      fs.ensureFile(p, err => {
        expect(!!err).toEqual(true);
        expect(err.code).toEqual('EISDIR');
        done()
      })
    })
  })
})

describe('+ ensureFileSync', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'ensure')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when file exists', () => {
    it('should not do anything', () => {
      const file = path.join(TEST_DIR, 'file.txt')
      fs.writeFileSync(file, 'blah')

      expect(fs.existsSync(file))
      fs.ensureFileSync(file)
      expect(fs.existsSync(file))
      expect(fs.readFileSync(file, 'utf8')).toEqual('blah')
    })
  })

  describe('> when file does not exist', () => {
    it('should create the file', () => {
      const file = path.join(TEST_DIR, 'dir/that/does/not/exist', 'file.txt')

      expect(fs.existsSync(file)).toEqual(false);
      fs.ensureFileSync(file)
      expect(fs.existsSync(file)).toEqual(true);
    })
  })

  describe('> when there is a directory at that path', () => {
    it('should error', () => {
      const p = path.join(TEST_DIR, 'somedir2')
      fs.mkdirSync(p)

      let err;
      try {
        fs.ensureFileSync(p);
      } catch (e) {
        err = e;
      }
      expect(err.code).toEqual('EISDIR');
    })
  })
})