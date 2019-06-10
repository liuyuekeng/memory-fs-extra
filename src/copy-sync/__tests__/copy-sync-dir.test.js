'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const crypto = require('crypto')
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ copySync() /dir', () => {
  const SIZE = 16 * 64 * 1024 + 7
  let TEST_DIR
  let src
  let dest

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-dir')
    src = path.join(TEST_DIR, 'src')
    dest = path.join(TEST_DIR, 'dest')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when src is a directory', () => {
    describe('> when dest exists and is a file', () => {
      it('should throw error', () => {
        const src = path.join(TEST_DIR, 'src')
        const dest = path.join(TEST_DIR, 'file.txt')
        fs.mkdirSync(src)
        fs.writeFileSync(dest, 'does not matter')
        try {
          fs.copySync(src, dest)
        } catch (err) {
          expect(err.message).toEqual(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
        }
      })
    })
  
    it('should copy the directory synchronously', () => {
      const FILES = 2
  
      src = path.join(TEST_DIR, 'src')
      dest = path.join(TEST_DIR, 'dest')
  
      fs.mkdirSync(src)
  
      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }
  
      const subdir = path.join(src, 'subdir')
  
      fs.mkdirSync(subdir)
  
      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }
  
      fs.copySync(src, dest)
      expect(fs.existsSync(dest)).toEqual(true)
  
      for (let i = 0; i < FILES; ++i) {
        expect(fs.existsSync(path.join(dest, i.toString()))).toEqual(true)
      }
  
      const destSub = path.join(dest, 'subdir')
      for (let j = 0; j < FILES; ++j) {
        expect(fs.existsSync(path.join(destSub, j.toString())))
      }
    })
  
    describe('> when the destination dir does not exist', () => {
      it('should create the destination directory and copy the file', () => {
        const src = path.join(TEST_DIR, 'data/')
        fs.mkdirSync(src)
  
        const d1 = 'file1'
        const d2 = 'file2'
  
        fs.writeFileSync(path.join(src, 'f1.txt'), d1)
        fs.writeFileSync(path.join(src, 'f2.txt'), d2)
  
        const dest = path.join(TEST_DIR, 'this/path/does/not/exist/outputDir')
  
        fs.copySync(src, dest)
  
        const o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
        const o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')
  
        expect(d1).toEqual(o1)
        expect(d2).toEqual(o2)
      })
    })
  })

  describe('> when filter is used', () => {
    it('should do nothing if filter fails', () => {
      const srcDir = path.join(TEST_DIR, 'src')
      const srcFile = path.join(srcDir, 'srcfile.css')
      fs.mkdirpSync(srcDir)
      fs.writeFileSync(srcFile, 'src contents')
      const destDir = path.join(TEST_DIR, 'dest')
      const destFile = path.join(destDir, 'destfile.css')
      const filter = s => path.extname(s) !== '.css' && !fs.statSync(s).isDirectory()

      fs.copySync(srcFile, destFile, filter)
      expect(fs.existsSync(destDir)).toEqual(false)
    })
    it('should should apply filter recursively', () => {
      const FILES = 2
      // Don't match anything that ends with a digit higher than 0:
      const filter = s => /(0|\D)$/i.test(s)

      fs.mkdirSync(src)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }

      const subdir = path.join(src, 'subdir')
      fs.mkdirSync(subdir)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }

      fs.copySync(src, dest, filter)

      expect(fs.existsSync(dest)).toEqual(true)
      expect(FILES > 1).toEqual(true)

      for (let i = 0; i < FILES; ++i) {
        if (i === 0) {
          expect(fs.existsSync(path.join(dest, i.toString()))).toEqual(true)
        } else {
          expect(fs.existsSync(path.join(dest, i.toString()))).toEqual(false)
        }
      }

      const destSub = path.join(dest, 'subdir')

      for (let j = 0; j < FILES; ++j) {
        if (j === 0) {
          expect(fs.existsSync(path.join(destSub, j.toString()))).toEqual(true)
        } else {
          expect(fs.existsSync(path.join(destSub, j.toString()))).toEqual(false)
        }
      }
    })

    it('should apply the filter to directory names', () => {
      const IGNORE = 'ignore'
      const filter = p => !~p.indexOf(IGNORE)

      fs.mkdirSync(src)

      const ignoreDir = path.join(src, IGNORE)
      fs.mkdirSync(ignoreDir)

      fs.writeFileSync(path.join(ignoreDir, 'file'), crypto.randomBytes(SIZE))

      fs.copySync(src, dest, filter)

      expect(fs.existsSync(path.join(dest, IGNORE))).toEqual(false)
      expect(fs.existsSync(path.join(dest, IGNORE, 'file'))).toEqual(false)
    })
  })
})
  