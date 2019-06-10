'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const crypto = require('crypto')
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

describe('+ copySync() /file', () => {
  const SIZE = 16 * 64 * 1024 + 7
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy-sync-file')
    fs.emptyDirSync(TEST_DIR)
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  describe('> when src is a file', () => {
    it('should copy the file synchronously', () => {
      const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')

      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))

      const srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      let destMd5 = ''

      fs.copySync(fileSrc, fileDest)

      destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
      expect(srcMd5).toEqual(destMd5)
    })

    it('should only copy files allowed by filter fn', () => {
      const srcFile1 = path.join(TEST_DIR, '1.html')
      const srcFile2 = path.join(TEST_DIR, '2.css')
      const srcFile3 = path.join(TEST_DIR, '3.jade')

      fs.writeFileSync(srcFile1, '1')
      fs.writeFileSync(srcFile2, '2')
      fs.writeFileSync(srcFile3, '3')

      const destFile1 = path.join(TEST_DIR, 'dest1.html')
      const destFile2 = path.join(TEST_DIR, 'dest2.css')
      const destFile3 = path.join(TEST_DIR, 'dest3.jade')

      const filter = s => s.split('.').pop() !== 'css'

      fs.copySync(srcFile1, destFile1, filter)
      fs.copySync(srcFile2, destFile2, filter)
      fs.copySync(srcFile3, destFile3, filter)

      expect(fs.existsSync(destFile1)).toEqual(true)
      expect(fs.existsSync(destFile2)).toEqual(false)
      expect(fs.existsSync(destFile3)).toEqual(true)
    })

    describe('> when the destination dir does not exist', () => {
      it('should create the destination directory and copy the file', () => {
        const src = path.join(TEST_DIR, 'file.txt')
        const dest = path.join(TEST_DIR, 'this/path/does/not/exist/copied.txt')
        const data = 'did it copy?\n'

        fs.writeFileSync(src, data, 'utf8')
        fs.copySync(src, dest)

        const data2 = fs.readFileSync(dest, 'utf8')

        expect(data).toEqual(data2)
      })
    })

    describe('> when overwrite option is passed', () => {
      const srcData = 'some src data'
      let src, dest

      beforeEach(() => {
        src = path.join(TEST_DIR, 'src-file')
        dest = path.join(TEST_DIR, 'des-file')

        // source file must always exist in these cases
        fs.writeFileSync(src, srcData)
      })

      describe('> when destination file does NOT exist', () => {
        describe('> when overwrite is true', () => {
          it('should copy the file and not throw an error', () => {
            fs.copySync(src, dest, { overwrite: true })
            const destData = fs.readFileSync(dest, 'utf8')
            expect(srcData).toEqual(destData)
          })
        })

        describe('> when overwrite is false', () => {
          it('should copy the file and not throw an error', () => {
            fs.copySync(src, dest, { overwrite: false })
            const destData = fs.readFileSync(dest, 'utf8')
            expect(srcData).toEqual(destData)
          })
        })
      })

      describe('when destination file does exist', () => {
        let destData

        beforeEach(() => {
          destData = 'some dest data'
          fs.writeFileSync(dest, destData)
        })

        describe('> when overwrite is true', () => {
          it('should copy the file and not throw an error', () => {
            fs.copySync(src, dest, { overwrite: true })
            destData = fs.readFileSync(dest, 'utf8')
            expect(srcData).toEqual(destData)
          })
        })

        describe('> when overwrite is false', () => {
          it('should not throw an error', () => {
            fs.copySync(src, dest, { overwrite: false })

            // copy never happened
            const destDataNew = fs.readFileSync(dest, 'utf8')
            expect(destData).toEqual(destDataNew)
          })
          it('should throw an error when errorOnExist is true', () => {
            expect(() => fs.copySync(src, dest, { overwrite: false, errorOnExist: true })).toThrow()

            // copy never happened
            const destDataNew = fs.readFileSync(dest, 'utf8')
            expect(destData).toEqual(destDataNew)
          })
        })
      })
    })

    describe('clobber', () => {
      let src, dest, srcData, destData

      beforeEach(() => {
        src = path.join(TEST_DIR, 'src-file')
        dest = path.join(TEST_DIR, 'des-file')
        srcData = 'some src data'
        destData = 'some dest data'
        fs.writeFileSync(src, srcData)
        fs.writeFileSync(dest, destData)
      })

      it('is an alias for overwrite', () => {
        fs.copySync(src, dest, { clobber: false })

        // copy never happened
        const destDataNew = fs.readFileSync(dest, 'utf8')
        expect(destData).toEqual(destDataNew)
      })
    })
  })
})
  