'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

let TEST_DIR

describe('json support promise', () => {
  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'json')
    fs.emptyDirSync(TEST_DIR)
  })
  afterEach(() => fs.rmdirSync(TEST_DIR))
  describe('writeJson, readJson', () => {
    it('should support promise', () => {
      const obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      }
      const file = path.join(TEST_DIR, 'promise.json')
      return fs.writeJson(file, obj1).then(() => {
        fs.readJson(file).then(obj2 => {
          expect(obj2).toEqual(obj1)
        })
      })
    })
  })
  describe('outputJson', () => {
    it('should support promise', () => {
      const obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      }
      const file = path.join(TEST_DIR, 'promise.json')
      return fs.outputJson(file, obj1).then(() => {
        fs.readJson(file).then(obj2 => {
          expect(obj2).toEqual(obj1)
        })
      })
    })
  })
})