'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global beforeEach, afterEach, describe, it */

// these files are used for all tests
const FILES = [
  'file0.txt',
  path.join('dir1', 'file1.txt'),
  path.join('dir1', 'dir2', 'file2.txt'),
  path.join('dir1', 'dir2', 'dir3', 'file3.txt')
]

const dat0 = 'file0'
const dat1 = 'file1'
const dat2 = 'file2'
const dat3 = 'file3'

describe('+ copySync() - prevent copying into itself', () => {
  let TEST_DIR, src

  beforeEach(done => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-prevent-copying-into-itself')
    src = path.join(TEST_DIR, 'src')
    fs.mkdirpSync(src)

    fs.outputFileSync(path.join(src, FILES[0]), dat0)
    fs.outputFileSync(path.join(src, FILES[1]), dat1)
    fs.outputFileSync(path.join(src, FILES[2]), dat2)
    fs.outputFileSync(path.join(src, FILES[3]), dat3)
    done()
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when source is a file', () => {
    it('should copy the file successfully even if dest parent is a subdir of src', () => {
      const srcFile = path.join(TEST_DIR, 'src', 'srcfile.txt')
      const destFile = path.join(TEST_DIR, 'src', 'dest', 'destfile.txt')
      fs.writeFileSync(srcFile, dat0)

      fs.copySync(srcFile, destFile)

      expect(fs.existsSync(destFile, 'file copied')).toEqual(true)
      const out = fs.readFileSync(destFile, 'utf8')
      expect(out).toEqual(dat0)
    })
  })

  // test for these cases:
  //  - src is directory, dest is directory
  //  - src is directory, dest is symlink
  //  - src is symlink, dest is directory
  //  - src is symlink, dest is symlink

  describe('> when source is a directory', () => {
    describe('>> when dest is a directory', () => {
      it(`of not itself`, () => {
        const dest = path.join(TEST_DIR, src.replace(/^\w:/, ''))
        return testSuccess(src, dest)
      })
      it(`of itself`, () => {
        const dest = path.join(src, 'dest')
        return testError(src, dest)
      })
      it(`should copy the directory successfully when dest is 'src_dest'`, () => {
        const dest = path.join(TEST_DIR, 'src_dest')
        return testSuccess(src, dest)
      })
      it(`should copy the directory successfully when dest is 'src-dest'`, () => {
        const dest = path.join(TEST_DIR, 'src-dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'dest_src'`, () => {
        const dest = path.join(TEST_DIR, 'dest_src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src_dest/src'`, () => {
        const dest = path.join(TEST_DIR, 'src_dest', 'src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src-dest/src'`, () => {
        const dest = path.join(TEST_DIR, 'src-dest', 'src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'dest_src/src'`, () => {
        const dest = path.join(TEST_DIR, 'dest_src', 'src')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src_src/dest'`, () => {
        const dest = path.join(TEST_DIR, 'src_src', 'dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'src-src/dest'`, () => {
        const dest = path.join(TEST_DIR, 'src-src', 'dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'srcsrc/dest'`, () => {
        const dest = path.join(TEST_DIR, 'srcsrc', 'dest')
        return testSuccess(src, dest)
      })

      it(`should copy the directory successfully when dest is 'dest/src'`, () => {
        const dest = path.join(TEST_DIR, 'dest', 'src')
        return testSuccess(src, dest)
      })

      it('should copy the directory successfully when dest is very nested that all its parents need to be created', () => {
        const dest = path.join(TEST_DIR, 'dest', 'src', 'foo', 'bar', 'baz', 'qux', 'quux', 'waldo',
          'grault', 'garply', 'fred', 'plugh', 'thud', 'some', 'highly', 'deeply',
          'badly', 'nasty', 'crazy', 'mad', 'nested', 'dest')
        return testSuccess(src, dest)
      })

      it(`should error when dest is 'src/dest'`, () => {
        const dest = path.join(TEST_DIR, 'src', 'dest')
        return testError(src, dest)
      })

      it(`should error when dest is 'src/src_dest'`, () => {
        const dest = path.join(TEST_DIR, 'src', 'src_dest')
        return testError(src, dest)
      })

      it(`should error when dest is 'src/dest_src'`, () => {
        const dest = path.join(TEST_DIR, 'src', 'dest_src')
        return testError(src, dest)
      })

      it(`should error when dest is 'src/dest/src'`, () => {
        const dest = path.join(TEST_DIR, 'src', 'dest', 'src')
        return testError(src, dest)
      })
    })
  })
})

function testSuccess (src, dest) {
  const srclen = fs.klawSync(src).length
  expect(srclen > 2).toEqual(true)

  fs.copySync(src, dest)

  FILES.forEach(f => expect(fs.existsSync(path.join(dest, f))).toEqual(true))

  const o0 = fs.readFileSync(path.join(dest, FILES[0]), 'utf8')
  const o1 = fs.readFileSync(path.join(dest, FILES[1]), 'utf8')
  const o2 = fs.readFileSync(path.join(dest, FILES[2]), 'utf8')
  const o3 = fs.readFileSync(path.join(dest, FILES[3]), 'utf8')

  expect(o0).toEqual(dat0)
  expect(o1).toEqual(dat1)
  expect(o2).toEqual(dat2)
  expect(o3).toEqual(dat3)
}

function testError (src, dest) {
  try {
    fs.copySync(src, dest)
  } catch (err) {
    expect(err.message).toEqual(`Cannot copy '${src}' to a subdirectory of itself, '${dest}'.`)
  }
}
