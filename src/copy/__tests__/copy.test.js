'use strict'

const os = require('os')
const path = require('path')
const crypto = require('crypto')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

/* global afterEach, beforeEach, describe, it */

const SIZE = 16 * 64 * 1024 + 7
let TEST_DIR = ''

describe('copy', () => {
  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'copy')
    fs.mkdirpSync(TEST_DIR)
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  it('should return an error if src and dest are the same', done => {
    const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_copy')
    const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
    fs.writeFileSync(fileSrc, 'data')

    fs.copy(fileSrc, fileDest, err => {
      expect(err.message).toEqual('Source and destination must not be the same.')
      done()
    })
  })

  it('should error when overwrite=false and file exists', done => {
    const src = path.join(TEST_DIR, 'src.txt')
    const dest = path.join(TEST_DIR, 'dest.txt')

    fs.writeFileSync(src, 'data')
    fs.writeFileSync(dest, 'data')
    fs.copy(src, dest, { overwrite: false, errorOnExist: true }, err => {
      expect(!!err).toEqual(true)
      done()
    })
  })

  it('should error when overwrite=false and file exists in a dir', done => {
    const src = path.join(TEST_DIR, 'src', 'sfile.txt')
    const dest = path.join(TEST_DIR, 'dest', 'dfile.txt')

    fs.outputFileSync(src, 'data')
    fs.outputFileSync(dest, 'data')
    
    fs.copy(src, dest, { overwrite: false, errorOnExist: true }, err => {
      expect(!!err).toEqual(true)
      done()
    })
  })

  describe('> when src is a file', () => {
    it('should copy the file asynchronously', done => {
      const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')
      fs.writeFileSync(fileSrc, crypto.randomBytes(SIZE))
      const srcMd5 = crypto.createHash('md5').update(fs.readFileSync(fileSrc)).digest('hex')
      let destMd5 = ''

      fs.copy(fileSrc, fileDest, err => {
        expect(!err).toEqual(true)
        destMd5 = crypto.createHash('md5').update(fs.readFileSync(fileDest)).digest('hex')
        expect(srcMd5).toEqual(destMd5)
        done()
      })
    })

    it('should return an error if src file does not exist', done => {
      const fileSrc = 'we-simply-assume-this-file-does-not-exist.bin'
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_copy')

      fs.copy(fileSrc, fileDest, err => {
        expect(!!err).toEqual(true)
        done()
      })
    })

    it('should copy to a destination file with two \'$\' characters in name (eg: TEST_fs-extra_$$_copy)', done => {
      const fileSrc = path.join(TEST_DIR, 'TEST_fs-extra_src')
      const fileDest = path.join(TEST_DIR, 'TEST_fs-extra_$$_copy')

      fs.writeFileSync(fileSrc, 'data')

      fs.copy(fileSrc, fileDest, err => {
        expect(!err).toEqual(true)
        fs.statSync(fileDest)
        done()
      })
    })

    describe('> when the destination dir does not exist', () => {
      it('should create the destination directory and copy the file', done => {
        const src = path.join(TEST_DIR, 'file.txt')
        const dest = path.join(TEST_DIR, 'this/path/does/not/exist/copied.txt')
        const data = 'did it copy?\n'

        fs.writeFileSync(src, data, 'utf8')

        fs.copy(src, dest, err => {
          const data2 = fs.readFileSync(dest, 'utf8')
          expect(data).toEqual(data2)
          done(err)
        })
      })
    })
  })

  describe('> when src is a directory', () => {
    describe('> when src directory does not exist', () => {
      it('should return an error', done => {
        const ts = path.join(TEST_DIR, 'this_dir_does_not_exist')
        const td = path.join(TEST_DIR, 'this_dir_really_does_not_matter')
        fs.copy(ts, td, err => {
          expect(!!err).toEqual(true)
          done()
        })
      })
    })

    describe('> when dest exists and is a file', () => {
      it('should return an error', done => {
        const src = path.join(TEST_DIR, 'src')
        const dest = path.join(TEST_DIR, 'file.txt')
        fs.mkdirSync(src)
        fs.writeFileSync(dest, 'data')

        fs.copy(src, dest, err => {
          expect(err.message).toEqual(`Cannot overwrite non-directory '${dest}' with directory '${src}'.`)
          done()
        })
      })
    })

    it('should copy the directory asynchronously', done => {
      const FILES = 2
      const src = path.join(TEST_DIR, 'src')
      const dest = path.join(TEST_DIR, 'dest')

      fs.mkdirpSync(src)
      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }

      const subdir = path.join(src, 'subdir')
      fs.mkdirpSync(subdir)
      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }

      fs.copy(src, dest, err => {
        expect(!err).toEqual(true)
        expect(fs.existsSync(dest)).toEqual(true)

        for (let i = 0; i < FILES; ++i) {
          expect(fs.existsSync(path.join(dest, i.toString()))).toEqual(true)
        }

        const destSub = path.join(dest, 'subdir')
        for (let j = 0; j < FILES; ++j) {
          expect(fs.existsSync(path.join(destSub, j.toString()))).toEqual(true)
        }

        done()
      })
    })

    describe('> when the destination dir does not exist', () => {
      it('should create the destination directory and copy the file', done => {
        const src = path.join(TEST_DIR, 'data/')
        fs.mkdirpSync(src)
        const d1 = 'file1'
        const d2 = 'file2'

        fs.writeFileSync(path.join(src, 'f1.txt'), d1)
        fs.writeFileSync(path.join(src, 'f2.txt'), d2)

        const dest = path.join(TEST_DIR, 'this/path/does/not/exist/outputDir')

        fs.copy(src, dest, err => {
          const o1 = fs.readFileSync(path.join(dest, 'f1.txt'), 'utf8')
          const o2 = fs.readFileSync(path.join(dest, 'f2.txt'), 'utf8')

          expect(d1).toEqual(o1)
          expect(d2).toEqual(o2)

          done(err)
        })
      })
    })

    describe('> when src dir does not exist', () => {
      it('should return an error', done => {
        fs.copy('/does/not/exist', '/something/else', err => {
          expect(err instanceof Error).toEqual(true)
          done()
        })
      })
    })
  })

  describe('> when filter is used', () => {
    it('should do nothing if filter fails', done => {
      const srcDir = path.join(TEST_DIR, 'src')
      const srcFile = path.join(srcDir, 'srcfile.css')
      fs.outputFileSync(srcFile, 'src contents')
      const destDir = path.join(TEST_DIR, 'dest')
      const destFile = path.join(destDir, 'destfile.css')
      const filter = s => {
        return path.extname(s) !== '.css' && !fs.statSync(s).isDirectory()
      }

      fs.copy(srcFile, destFile, filter, err => {
        expect(!err).toEqual(true)
        expect(!fs.existsSync(destDir)).toEqual(true)
        done()
      })
    })

    it('should only copy files allowed by filter fn', done => {
      const srcFile1 = path.join(TEST_DIR, '1.css')
      fs.writeFileSync(srcFile1, 'data')
      const destFile1 = path.join(TEST_DIR, 'dest1.css')
      const filter = s => s.split('.').pop() !== 'css'

      fs.copy(srcFile1, destFile1, filter, err => {
        expect(!err).toEqual(true)
        expect(!fs.existsSync(destFile1)).toEqual(true)
        done()
      })
    })

    it('accepts options object in place of filter', done => {
      const srcFile1 = path.join(TEST_DIR, '1.jade')
      fs.writeFileSync(srcFile1, 'data')
      const destFile1 = path.join(TEST_DIR, 'dest1.jade')
      const options = { filter: s => /.html$|.css$/i.test(s) }

      fs.copy(srcFile1, destFile1, options, (err) => {
        expect(!err).toEqual(true)
        expect(!fs.existsSync(destFile1)).toEqual(true)
        done()
      })
    })

    // not support yet
    /*
    it('allows filter fn to return a promise', done => {
      const srcFile1 = path.join(TEST_DIR, '1.css')
      fs.writeFileSync(srcFile1, 'data')
      const destFile1 = path.join(TEST_DIR, 'dest1.css')
      const filter = s => Promise.resolve(s.split('.').pop() !== 'css')

      fs.copy(srcFile1, destFile1, filter, err => {
        expect(!err).toEqual(true)
        expect(!fs.existsSync(destFile1)).toEqual(true)
        done()
      })
    })
    */

    it('should apply filter recursively', done => {
      const FILES = 2
      // Don't match anything that ends with a digit higher than 0:
      const filter = s => /(0|\D)$/i.test(s)

      const src = path.join(TEST_DIR, 'src')
      fs.mkdirpSync(src)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(src, i.toString()), crypto.randomBytes(SIZE))
      }

      const subdir = path.join(src, 'subdir')
      fs.mkdirpSync(subdir)

      for (let i = 0; i < FILES; ++i) {
        fs.writeFileSync(path.join(subdir, i.toString()), crypto.randomBytes(SIZE))
      }
      const dest = path.join(TEST_DIR, 'dest')
      fs.copy(src, dest, filter, err => {
        expect(!err).toEqual(true)

        expect(fs.existsSync(dest)).toEqual(true)
        expect(FILES > 1).toEqual(true)

        for (let i = 0; i < FILES; ++i) {
          if (i === 0) {
            expect(fs.existsSync(path.join(dest, i.toString()))).toEqual(true)
          } else {
            expect(!fs.existsSync(path.join(dest, i.toString()))).toEqual(true)
          }
        }

        const destSub = path.join(dest, 'subdir')

        for (let j = 0; j < FILES; ++j) {
          if (j === 0) {
            expect(fs.existsSync(path.join(destSub, j.toString()))).toEqual(true)
          } else {
            expect(!fs.existsSync(path.join(destSub, j.toString()))).toEqual(true)
          }
        }
        done()
      })
    })

    it('should apply filter to directory names', done => {
      const IGNORE = 'ignore'
      const filter = p => !~p.indexOf(IGNORE)

      const src = path.join(TEST_DIR, 'src')
      fs.mkdirpSync(src)

      const ignoreDir = path.join(src, IGNORE)
      fs.mkdirpSync(ignoreDir)

      fs.writeFileSync(path.join(ignoreDir, 'file'), crypto.randomBytes(SIZE))

      const dest = path.join(TEST_DIR, 'dest')

      fs.copy(src, dest, filter, err => {
        expect(!err).toEqual(true)
        expect(!fs.existsSync(path.join(dest, IGNORE))).toEqual(true)
        expect(!fs.existsSync(path.join(dest, IGNORE, 'file'))).toEqual(true)
        done()
      })
    })
  })
})
