'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ createFileSync', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'create')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when the file and directory dose not exist', () => {
    it('should create the file', () => {
      const file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt');
      expect(fs.existsSync(file)).toEqual(false);
      fs.createFileSync(file);
      expect(fs.existsSync(file)).toEqual(true);
    })
  })
  describe('> when th file dose exist', () => {
    it('should not modify the file', () => {
      const file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt');
      fs.mkdirpSync(path.dirname(file));
      fs.writeFileSync(file, 'hello world');
      fs.createFileSync(file);
      expect(fs.readFileSync(file, 'utf8')).toEqual('hello world');
    })
  });
})

describe('+ createFile', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'ensure')
    fs.emptyDirSync(TEST_DIR);
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when the file and directory dose not exist', () => {
    it('should create the file', done => {
      const file = path.join(TEST_DIR, Math.random() + 't-ne', Math.random() + '.txt');
      expect(fs.existsSync(file)).toEqual(false);
      fs.createFile(file, err => {
        expect(!err).toEqual(true);
        expect(fs.existsSync(file)).toEqual(true);
        done();
      });
    })
  })
  describe('> when th file dose exist', () => {
    it('should not modify the file', done => {
      const file = path.join(TEST_DIR, Math.random() + 't-e', Math.random() + '.txt');
      fs.mkdirpSync(path.dirname(file));
      fs.writeFileSync(file, 'hello world');
      fs.createFile(file, err => {
        expect(!err).toEqual(true);
        expect(fs.readFileSync(file, 'utf8')).toEqual('hello world');
        done();
      });
    })
  });
})