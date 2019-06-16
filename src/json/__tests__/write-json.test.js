'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ writeJsonSync', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'write-json-sync')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))
  it('should tack an object and write a json file', () => {
    const obj1 = {
      firstName: 'JP',
      lastName: 'Richardson'
    }

    const file = path.join(TEST_DIR, 'file.json')
    fs.writeJsonSync(file, obj1)
    const data = fs.readFileSync(file, 'utf8')
    expect(data).toEqual(JSON.stringify(obj1) + '\n')
  })

  it('should handle options.space and options.EOL', () => {
    const obj1 = {
      firstName: 'JP',
      lastName: 'Richardson'
    }

    const file = path.join(TEST_DIR, 'file.json')
    fs.writeJsonSync(file, obj1, { spaces: 2, EOL: '\r\n' })
    const data = fs.readFileSync(file, 'utf8')
    expect(data)
    .toEqual(JSON.stringify(obj1, null, 2)
        .replace(/\n/g, '\r\n') + '\r\n')
  })
})

describe('+ writeJson', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'write-json')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))
  it('should tack an object and write a json file', done => {
    const obj1 = {
      firstName: 'JP',
      lastName: 'Richardson'
    }

    const file = path.join(TEST_DIR, 'file.json')
    fs.writeJson(file, obj1, err => {
      expect(!err).toEqual(true)
      const data = fs.readFileSync(file, 'utf8')
      expect(data).toEqual(JSON.stringify(obj1) + '\n')
      done()
    })
  })

  it('should handle options.space and options.EOL', done => {
    const obj1 = {
      firstName: 'JP',
      lastName: 'Richardson'
    }

    const file = path.join(TEST_DIR, 'file.json')
    fs.writeJson(file, obj1, { spaces: 2, EOL: '\r\n' }, err => {
      expect(!err).toEqual(true);
      const data = fs.readFileSync(file, 'utf8')
      expect(data)
      .toEqual(JSON.stringify(obj1, null, 2).replace(/\n/g, '\r\n')
      + '\r\n')
      done();
    })
  })
})