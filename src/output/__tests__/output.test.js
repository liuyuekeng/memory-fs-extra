'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index')
const fs = new MemoryFsExtra()

/* global afterEach, beforeEach, describe, it */

describe('output', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'output')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('+ outputFile', () => {
    describe('> when the file and directory does not exist', () => {
      it('should create the file', done => {
        const file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        expect(fs.existsSync(file)).toEqual(false)
        fs.outputFile(file, 'hi jp', err => {
          expect(!!err).toEqual(false)
          expect(fs.existsSync(file)).toEqual(true)
          expect(fs.readFileSync(file, 'utf8')).toEqual('hi jp')
          done()
        })
      })
      it('should support promises', () => {
        const file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt')
        expect(fs.existsSync(file)).toEqual(false)
        return fs.outputFile(file, 'hi jp')
      })
    })

    describe('> when the file does exist', () => {
      it('should still modify the file', done => {
        const file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt')
        fs.mkdirpSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fs.outputFile(file, 'hello jp', err => {
          if (err) return done(err)
          expect(fs.readFileSync(file, 'utf8')).toEqual('hello jp')
          done()
        })
      })
    })
  })

  describe('+ outputFileSync', () => {
    describe('> when the file and directory does not exist', () => {
      it('should create the file', () => {
        const file = path.join(TEST_DIR, Math.random() + 'ts-ne', Math.random() + '.txt')
        expect(fs.existsSync(file)).toEqual(false)
        fs.outputFileSync(file, 'hello man')
        expect(fs.existsSync(file))
        expect(fs.readFileSync(file, 'utf8')).toEqual('hello man')
      })
    })

    describe('> when the file does exist', () => {
      it('should still modify the file', () => {
        const file = path.join(TEST_DIR, Math.random() + 'ts-e', Math.random() + '.txt')
        fs.mkdirpSync(path.dirname(file))
        fs.writeFileSync(file, 'hello world')
        fs.outputFileSync(file, 'hello man')
        expect(fs.readFileSync(file, 'utf8')).toEqual('hello man')
      })
    })
  })
})
