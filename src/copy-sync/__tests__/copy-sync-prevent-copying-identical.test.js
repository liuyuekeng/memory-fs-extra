'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ copySync() - prevent copying identical files and dirs', () => {
  let TEST_DIR = ''
  let src = ''
  let dest = ''

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-prevent-copying-identical')
    fs.emptyDir(TEST_DIR, done)
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  it('should return an error if src and dest are the same', () => {
    const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_copy_sync')
    const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy_sync')
    fs.writeFileSync(fileSrc, 'some data')

    try {
      fs.copySync(fileSrc, fileDest)
    } catch (err) {
      expect(err.message).toEqual('Source and destination must not be the same.')
    }
  })
})
