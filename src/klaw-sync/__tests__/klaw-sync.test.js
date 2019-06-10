'use strict'
const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index')
const fs = new MemoryFsExtra()

describe('klaw-sync', () => {
  const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'klaw-sync')
  const dirnames = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
  const filenames = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
  let DIRS
  let FILES

  beforeEach(() => {
    fs.emptyDirSync(TEST_DIR)
    DIRS = dirnames.map(dir => path.join(TEST_DIR, dir))
    FILES = filenames.map(f => path.join(TEST_DIR, f))
    DIRS.forEach(dir => fs.mkdirpSync(dir))
    FILES.forEach(f => fs.writeFileSync(f, 'data'))
  })

  afterEach(() => fs.rmdirSync(TEST_DIR))

  it('should return an error if the source dir does not exist', () => {
    try {
      fs.klawSync('dirDoesNotExist/')
    } catch (err) {
      expect(err.code).toEqual('ENOENT')
    }
  })

  it('should return an error if the source is not a dir', () => {
    try {
      fs.klawSync(FILES[0])
    } catch (err) {
      expect(err.code).toEqual('ENOTDIR')
    }
  })

  it('should return all items of a dir containing path and stats object', () => {
    const paths = [
      {path: DIRS[0], stats: fs.statSync(DIRS[0])},
      {path: FILES[0], stats: fs.statSync(FILES[0])},
      {path: DIRS[1], stats: fs.statSync(DIRS[1])},
      {path: DIRS[2], stats: fs.statSync(DIRS[2])},
      {path: DIRS[3], stats: fs.statSync(DIRS[3])},
      {path: FILES[1], stats: fs.statSync(FILES[1])},
      {path: FILES[2], stats: fs.statSync(FILES[2])}
    ]
    const items = fs.klawSync(TEST_DIR)
    expect(items.length).toEqual(paths.length)
    items.forEach((p, i) => {
      expect(p).toEqual(paths[i])
      expect(p.path).toEqual(paths[i].path)
      expect(p.stats).toEqual(paths[i].stats)
    })
  })

  it('should return only files if opts.nodir is true', () => {
    const filesOnly = [
      {path: FILES[0], stats: fs.statSync(FILES[0])},
      {path: FILES[1], stats: fs.statSync(FILES[1])},
      {path: FILES[2], stats: fs.statSync(FILES[2])}
    ]
    const files = fs.klawSync(TEST_DIR, {nodir: true})
    expect(files.length).toEqual(filesOnly.length)
    files.forEach((f, i) => {
      expect(f).toEqual(filesOnly[i])
      expect(f.path).toEqual(filesOnly[i].path)
      expect(f.stats).toEqual(filesOnly[i].stats)
    })
  })

  it('should return only dirs if opts.nofile is true', () => {
    const dirsOnly = [
      {path: DIRS[0], stats: fs.statSync(DIRS[0])},
      {path: DIRS[1], stats: fs.statSync(DIRS[1])},
      {path: DIRS[2], stats: fs.statSync(DIRS[2])},
      {path: DIRS[3], stats: fs.statSync(DIRS[3])}
    ]
    const dirs = fs.klawSync(TEST_DIR, {nofile: true})
    expect(dirs.length).toEqual(dirsOnly.length)
    dirs.forEach((dir, i) => {
      expect(dir).toEqual(dirsOnly[i])
      expect(dir.path).toEqual(dirsOnly[i].path)
      expect(dir.stats).toEqual(dirsOnly[i].stats)
    })
  })

  describe('when opts.filter is true', () => {
    it('should filter based on path', () => {
      const f1 = path.join(TEST_DIR, 'foo.js')
      const f2 = path.join(TEST_DIR, 'bar.js')
      fs.writeFileSync(f1, 'f1')
      fs.writeFileSync(f2, 'f2')
      const paths = [{path: f1, stats: fs.statSync(f1)}]
      const filterFunc = i => path.basename(i.path).indexOf('foo') > -1
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc})
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })

    it('should filter based on stats', () => {
      const f1 = path.join(TEST_DIR, 'bar.js')
      const f2 = path.join(TEST_DIR, 'foo.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => i.path === TEST_DIR || (i.stats.isFile() && i.stats.size === 20)
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc})
      items.sort()
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })

    it('should filter based on both path and stats', () => {
      const f1 = path.join(TEST_DIR, 'foo.js')
      const f2 = path.join(TEST_DIR, 'bar.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [{path: f1, stats: fs.statSync(f1)}]
      const filterFunc = i => i.path === TEST_DIR || (path.basename(i.path).indexOf('foo') > -1 && i.stats.isFile() && i.stats.size === 20)
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc})
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })

    it('should ignore hidden directories', () => {
      const dir1 = path.join(TEST_DIR, '.dir1')
      const dir2 = path.join(TEST_DIR, '.dir2')
      fs.mkdirpSync(dir1)
      fs.mkdirpSync(dir2)
      const filterFunc = i => path.basename(i.path) === '.' || path.basename(i.path)[0] !== '.'
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc})
      expect(items.length > 0)
      items.forEach(p => {
        expect(p.path).not.toEqual(dir1)
        expect(p.path).not.toEqual(dir2)
      })
    })

    it('should filter and apply opts.nodir', () => {
      const f1 = path.join(TEST_DIR, 'bar.js')
      const f2 = path.join(TEST_DIR, 'foo.js')
      fs.outputFileSync(f1, 'test file 1 contents')
      fs.outputFileSync(f2, 'test file 2 contents')
      const paths = [
        {path: f1, stats: fs.statSync(f1)},
        {path: f2, stats: fs.statSync(f2)}
      ]
      const filterFunc = i => i.path === TEST_DIR || (i.stats.isFile() && i.stats.size === 20)
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc, nodir: true})
      items.sort()
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })

    it('should filter and apply opts.nofile', () => {
      const f = path.join(TEST_DIR, 'foo.js')
      const d1 = path.join(TEST_DIR, 'foo')
      const d2 = path.join(TEST_DIR, 'foobar')
      fs.writeFileSync(f, 'test file 1 contents')
      fs.mkdirpSync(d1)
      fs.mkdirpSync(d2)
      const paths = [
        {path: d1, stats: fs.statSync(d1)},
        {path: d2, stats: fs.statSync(d2)}
      ]
      const filterFunc = i => i.path.indexOf('foo') > 0
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc, nofile: true})
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })
  })

  describe('depth limit', () => {
    beforeEach(() => {
      fs.emptyDirSync(TEST_DIR)
    })
    it('should honor depthLimit option -1', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i',
        'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      testDepthLimit(-1, expected)
    })

    it('should honor depthLimit option 0', () => {
      const expected = ['a', 'h']
      testDepthLimit(0, expected)
    })

    it('should honor depthLimit option 1', () => {
      const expected = ['a', 'a/b', 'a/e.jpg', 'h', 'h/i']
      testDepthLimit(1, expected)
    })

    it('should honor depthLimit option 2', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/e.jpg', 'h', 'h/i', 'h/i/j',
        'h/i/l.txt', 'h/i/m.jpg']
      testDepthLimit(2, expected)
    })

    it('should honor depthLimit option 3', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i',
        'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg']
      testDepthLimit(3, expected)
    })

    it('should honor depthLimit option -1 with nodir = true', () => {
      const expected = ['a/b/c/d.txt', 'a/e.jpg', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']
      testDepthLimitNoDir(-1, expected)
    })

    it('should honor depthLimit option 0 with nodir = true', () => {
      const expected = ['t.txt']
      testDepthLimitNoDir(0, expected)
    })

    it('should honor depthLimit option 1 with nodir = true', () => {
      const expected = ['a/e.jpg', 't.txt']
      testDepthLimitNoDir(1, expected)
    })

    it('should honor depthLimit option -1 with nodir = true and with a filter to search for a specific file', () => {
      let expected = ['h/i/j/k.txt']
      const fixtures = [
        'a/b/c/d.txt',
        'a/e.jpg',
        'h/i/j/k.txt',
        'h/i/l.txt',
        'h/i/m.jpg',
        't.txt'
      ]

      const filterFunction = function (item) {
        return item.stats.isDirectory() || path.basename(item.path) === 'k.txt'
      }

      fixtures.forEach(f => {
        f = path.join(TEST_DIR, f)
        fs.outputFileSync(f, path.basename(f, path.extname(f)))
      })

      const items = fs.klawSync(TEST_DIR, {depthLimit: -1, nodir: true, filter: filterFunction}).map(i => i.path)
      items.sort()
      expected = expected.map(item => path.join(path.join(TEST_DIR, item)))
      expect(items).toEqual(expected)
    })

    it('should return all files except under filtered out directory', () => {
      let expected = ['a/b/c/d.txt', 'a/e.jpg', 't.txt']
      const fixtures = [
        'a/b/c/d.txt',
        'a/e.jpg',
        'h/i/j/k.txt',
        'h/i/l.txt',
        'h/i/m.jpg',
        't.txt'
      ]

      const filterFunction = function (item) {
        return !item.stats.isDirectory() || (item.stats.isDirectory() && path.basename(item.path) !== 'i')
      }

      fixtures.forEach(f => {
        f = path.join(TEST_DIR, f)
        fs.outputFileSync(f, path.basename(f, path.extname(f)))
      })

      const items = fs.klawSync(TEST_DIR, {depthLimit: -1, nodir: true, filter: filterFunction}).map(i => i.path)
      items.sort()
      expected = expected.map(item => path.join(path.join(TEST_DIR, item)))
      expect(items).toEqual(expected)
    })

    function testDepthLimitNoDir (depthLimit, expected) {
      const fixtures = [
        'a/b/c/d.txt',
        'a/e.jpg',
        'h/i/j/k.txt',
        'h/i/l.txt',
        'h/i/m.jpg',
        't.txt'
      ]
      fixtures.forEach(f => {
        f = path.join(TEST_DIR, f)
        fs.outputFileSync(f, path.basename(f, path.extname(f)))
      })

      const items = fs.klawSync(TEST_DIR, {depthLimit: depthLimit, nodir: true}).map(i => i.path)
      items.sort()
      expected = expected.map(item => path.join(path.join(TEST_DIR, item)))
      expect(items).toEqual(expected)
    }

    function testDepthLimit (depthLimit, expected) {
      const fixtures = [
        'a/b/c/d.txt',
        'a/e.jpg',
        'h/i/j/k.txt',
        'h/i/l.txt',
        'h/i/m.jpg'
      ]
      fixtures.forEach(f => {
        f = path.join(TEST_DIR, f)
        fs.outputFileSync(f, path.basename(f, path.extname(f)))
      })

      const items = fs.klawSync(TEST_DIR, {depthLimit: depthLimit}).map(i => i.path)
      items.sort()
      expected = expected.map(item => path.join(path.join(TEST_DIR, item)))
      expect(items).toEqual(expected)
    }
  })
  describe('traverse all', function () {
    beforeEach(() => {
      fs.emptyDirSync(TEST_DIR)
    })
    it('should honor traverseAll option with no filter & nodir: false', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/b/c/d.txt', 'a/e.jpg', 'h', 'h/i',
        'h/i/j', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']
      testTraverseAll({ nodir: false }, expected)
    })
    it('should honor traverseAll option with no filter & nodir: true', () => {
      const expected = ['a/b/c/d.txt', 'a/e.jpg', 'h/i/j/k.txt', 'h/i/l.txt', 'h/i/m.jpg', 't.txt']
      testTraverseAll({ nodir: true }, expected)
    })
    it('should honor traverseAll option with filter & nodir: true', () => {
      const expected = ['a/b/c/d.txt', 'h/i/j/k.txt', 'h/i/l.txt', 't.txt']
      const filter = function (item) {
        return path.extname(item.path) === '.txt' // no need to greenlight dirs in filter
      }
      testTraverseAll({ nodir: true, filter }, expected)
    })
    it('should honor traverseAll option with filter & nodir: false', () => {
      const expected = ['a', 'a/b', 'a/b/c', 'a/e.jpg', 'h',
        'h/i/j', 'h/i/m.jpg']
      const filter = function (item) {
        return path.basename(item.path) !== 'i' && path.extname(item.path) !== '.txt'
      }
      testTraverseAll({ nodir: false, filter }, expected)
    })

    function testTraverseAll ({ filter, nodir = false } = {}, expected) {
      const fixtures = [
        'a/b/c/d.txt',
        'a/e.jpg',
        'h/i/j/k.txt',
        'h/i/l.txt',
        'h/i/m.jpg',
        't.txt'
      ]
      fixtures.forEach(f => {
        f = path.join(TEST_DIR, f)
        fs.outputFileSync(f, path.basename(f, path.extname(f)))
      })

      const items = fs.klawSync(TEST_DIR, { traverseAll: true, nodir, filter }).map(i => i.path)
      items.sort()
      expected = expected.map(item => path.join(path.join(TEST_DIR, item)))
      expect(items).toEqual(expected)
    }
  })
})
