'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ readJsonSync', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'read-json-sync')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> while the file contents json data', () => {
    it('should parse it and return an object', () => {
      const obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      }
      const file = path.join(TEST_DIR, 'file.json')
      fs.writeFileSync(file, JSON.stringify(obj1))
      let obj2 = fs.readJsonSync(file);
      expect(obj1).toEqual(obj2);
    })
  })
  describe('> while the file cant not be parsed', () => {
    it('should throw an error', () => {
      const file = path.join(TEST_DIR, 'file2.json')
      fs.writeFileSync(file, '%asdfasdff444')
      expect(() => {
        fs.readJsonSync(file)
      }).toThrow()
    });
  })
})

describe('+ readJson', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'read-json')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> while the file contents json data', () => {
    it('should parse it and return an object', () => {
      const obj1 = {
        firstName: 'JP',
        lastName: 'Richardson'
      }
      const file = path.join(TEST_DIR, 'file.json')
      fs.writeFileSync(file, JSON.stringify(obj1))
      fs.readJson(file, (err, obj2) => {
        expect(!err).toEqual(true);
        expect(obj1).toEqual(obj2);
      });
    })
  })
  describe('> while the file cant not be parsed', () => {
    it('should throw an error', () => {
      const file = path.join(TEST_DIR, 'file2.json')
      fs.writeFileSync(file, '%asdfasdff444')
      fs.readJson(file, (err, obj2) => {
        expect(!!err).toEqual(true);
        expect(!obj2).toEqual(true);
      })
    });
  })
})