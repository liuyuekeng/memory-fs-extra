'use strict'

const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index');
const fs = new MemoryFsExtra();

describe('move', () => {
  let TEST_DIR

  beforeEach(() => {
    TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'move')
    fs.emptyDirSync(TEST_DIR)

    fs.outputFileSync(path.join(TEST_DIR, 'a-file'), 'sonic the hedgehog\n')
    fs.outputFileSync(path.join(TEST_DIR, 'a-folder/another-file'), 'tails\n')
    fs.outputFileSync(path.join(TEST_DIR, 'a-folder/another-folder/file3'), 'knuckles\n')
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  it('should not move if src and dest are the same', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-file`

    fs.move(src, dest, err => {
      expect(err.message).toEqual('Source and destination must not be the same.');
      done()
    })

    // assert src not affected
    const contents = fs.readFileSync(src, 'utf8')
    const expected = /^sonic the hedgehog\r?\n$/
    expect(expected.test(contents)).toEqual(true)
  })

  it('should throw error if src and dest are the same and src dose not exist', done => {
    const src = `${TEST_DIR}/non-existent`
    const dest = src
    fs.move(src, dest, err => {
      expect(!!err).toEqual(true)
      done()
    })
  }) 

  it('should rename a file on the same device', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-file-dest`

    fs.move(src, dest, err => {
      const contents = fs.readFileSync(dest, 'utf8')
      const expected = /^sonic the hedgehog\r?\n$/
      expect(expected.test(contents)).toEqual(true)
      done()
    })
  })

  it('should not overwrite the destination by default', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-file`

    // verify file exists already
    expect(fs.existsSync(dest)).toEqual(true)

    fs.move(src, dest, err => {
      expect(err.message).toEqual('dest already exists.')
      done()
    })
  })

  it('should not overwrite if overwrite = false', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-file`

    // verify file exists already
    expect(fs.existsSync(dest)).toEqual(true)

    fs.move(src, dest, { overwrite: false }, err => {
      expect(err.message).toEqual('dest already exists.')
      done()
    })
  })

  it('should overwrite file if overwrite = true', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/a-folder/another-file`

    // verify file exists already
    expect(fs.existsSync(dest)).toEqual(true)

    fs.move(src, dest, { overwrite: true }, err => {
      const contents = fs.readFileSync(dest, 'utf8')
      const expected = /^sonic the hedgehog\r?\n$/
      expect(expected.test(contents)).toEqual(true)
      done()
    })
  })

  it('should overwrite the destination directory if overwrite = true', done => {
    // Create src
    const src = path.join(TEST_DIR, 'src')
    fs.mkdirpSync(src)
    fs.mkdirpSync(path.join(src, 'some-folder'))
    fs.writeFileSync(path.join(src, 'some-file'), 'hi')

    const dest = path.join(TEST_DIR, 'a-folder')

    // verify dest has stuff in it
    const pathsBefore = fs.readdirSync(dest)
    expect(pathsBefore.indexOf('another-file')).toBeGreaterThanOrEqual(0)
    expect(pathsBefore.indexOf('another-folder')).toBeGreaterThanOrEqual(0)

    fs.move(src, dest, { overwrite: true }, err => {
      // verify dest does not have old stuff
      const pathsAfter = fs.readdirSync(dest)
      expect(pathsAfter.indexOf('another-file')).toEqual(-1)
      expect(pathsAfter.indexOf('another-folder')).toEqual(-1)

      // verify dest has new stuff
      expect(pathsAfter.indexOf('some-file')).toBeGreaterThanOrEqual(0)
      expect(pathsAfter.indexOf('some-folder')).toBeGreaterThanOrEqual(0)
      done()
    })
  })

  it('should create directory structure by default', done => {
    const src = `${TEST_DIR}/a-file`
    const dest = `${TEST_DIR}/does/not/exist/a-file-dest`

    // verify dest directory does not exist
    expect(fs.existsSync(path.dirname(dest))).toEqual(false)

    fs.move(src, dest, err => {
      const contents = fs.readFileSync(dest, 'utf8')
      const expected = /^sonic the hedgehog\r?\n$/
      expect(expected.test(contents)).toEqual(true)
      done()
    })
  })

  it('should move folders', done => {
    const src = `${TEST_DIR}/a-folder`
    const dest = `${TEST_DIR}/a-folder-dest`

    // verify it doesn't exist
    expect(fs.existsSync(dest)).toEqual(false)

    fs.move(src, dest, err => {
      const contents = fs.readFileSync(dest + '/another-file', 'utf8')
      const expected = /^tails\r?\n$/
      expect(expected.test(contents)).toEqual(true)
      done()
    })
  }) 

  describe('clobber', () => {
    it('should be an alias for overwrite', done => {
      const src = `${TEST_DIR}/a-file`
      const dest = `${TEST_DIR}/a-folder/another-file`

      // verify file exists already
      expect(fs.existsSync(dest)).toEqual(true)

      fs.move(src, dest, { clobber: true }, err => {
        const contents = fs.readFileSync(dest, 'utf8')
        const expected = /^sonic the hedgehog\r?\n$/
        expect(expected.test(contents)).toEqual(true)
        done()
      })
    })
  })

  describe('> when trying to move a folder into itself', () => {
    it('should produce an error', done => {
      const SRC_DIR = path.join(TEST_DIR, 'src')
      const DEST_DIR = path.join(TEST_DIR, 'src', 'dest')

      expect(fs.existsSync(SRC_DIR)).toEqual(false)
      fs.mkdirSync(SRC_DIR)
      expect(fs.existsSync(SRC_DIR)).toEqual(true)

      fs.move(SRC_DIR, DEST_DIR, err => {
        expect(err.message).toEqual(`Cannot move '${SRC_DIR}' to a subdirectory of itself, '${DEST_DIR}'.`)
        expect(fs.existsSync(SRC_DIR)).toEqual(true)
        expect(fs.existsSync(DEST_DIR)).toEqual(false)
        done()
      })
    })
  })

  describe('> when trying to move a file into its parent subdirectory', () => {
    it('should move successfully', done => {
      const src = `${TEST_DIR}/a-file`
      const dest = `${TEST_DIR}/dest/a-file-dest`

      fs.move(src, dest, err => {
        const contents = fs.readFileSync(dest, 'utf8')
        const expected = /^sonic the hedgehog\r?\n$/
        expect(expected.test(contents)).toEqual(true)
        done()
      })
    })
  })
})