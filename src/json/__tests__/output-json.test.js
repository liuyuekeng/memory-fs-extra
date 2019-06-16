'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ outputJsonSync', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'output-json-sync')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> while the directory dose not exists', () => {
    it('should create the directory and write the file', () => {
      const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'file.json')
      expect(fs.existsSync(file)).toEqual(false)
  
      const data = { name: 'JP' }
      fs.outputJsonSync(file, data)
  
      expect(fs.existsSync(file)).toEqual(true)
      const newData = JSON.parse(fs.readFileSync(file, 'utf8'))
  
      expect(data).toEqual(newData)
    })
  })

  describe('> while option is passed', () => {
    it('should pass the option along to jsonfile module', () => {
      const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json')
      expect(fs.existsSync(file)).toEqual(false)

      const replacer = (k, v) => v === 'JP' ? 'Jon Paul' : v
      const data = { name: 'JP' }

      fs.outputJsonSync(file, data, { replacer })
      const newData = JSON.parse(fs.readFileSync(file, 'utf8'))

      expect(newData.name).toEqual('Jon Paul')
    });
  })
})

describe('+ outputJson', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'output-json-sync')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> while the directory dose not exists', () => {
    it('should create the directory and write the file', done => {
      const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'file.json')
      expect(fs.existsSync(file)).toEqual(false)
  
      const data = { name: 'JP' }
      fs.outputJson(file, data, err => {
        expect(!err).toEqual(true)
        expect(fs.existsSync(file)).toEqual(true)
        const newData = JSON.parse(fs.readFileSync(file, 'utf8'))
    
        expect(data).toEqual(newData)
        done()
      })
    })
  })

  describe('> while option is passed', () => {
    it('should pass the option along to jsonfile module', done => {
      const file = path.join(TEST_DIR, 'this-dir', 'does-not', 'exist', 'really', 'file.json')
      expect(fs.existsSync(file)).toEqual(false)

      const replacer = (k, v) => v === 'JP' ? 'Jon Paul' : v
      const data = { name: 'JP' }

      fs.outputJson(file, data, { replacer }, err => {
        expect(!err).toEqual(true)
        const newData = JSON.parse(fs.readFileSync(file, 'utf8'))
        expect(newData.name).toEqual('Jon Paul')
        done()
      })
    });
  })
})