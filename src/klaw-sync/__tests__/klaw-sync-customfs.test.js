'use strict'
const os = require('os')
const path = require('path')
const MemoryFsExtra = require('../../index')
const fs = new MemoryFsExtra()
const cfs = new MemoryFsExtra()

const TEST_DIR = path.join(os.tmpdir(), 'test-fs-extra', 'klaw-sync-custom-fs')

describe('klaw-sync / custom fs', () => {
  const dirnames = ['dir1', 'dir2', 'dir2/dir2_1', 'dir2/dir2_1/dir2_1_1']
  const filenames = ['dir1/file1_2', 'dir2/dir2_1/file2_1_1', 'file1']
  cfs.mkdirpSync(TEST_DIR)
  let DIRS, FILES

  beforeEach(() => {
    cfs.rmdirSync(TEST_DIR)
    cfs.mkdirpSync(TEST_DIR)
    DIRS = dirnames.map(dir => path.join(TEST_DIR, dir))
    FILES = filenames.map(f => path.join(TEST_DIR, f))
    DIRS.forEach(dir => cfs.mkdirpSync(dir))
    FILES.forEach((f, i) => cfs.writeFileSync(f, i.toString()))
  })
  //afterEach(() => cfs.rmdirSync(TEST_DIR))

  it('should return all items of a dir containing path and stats object', () => {
    const paths = [
      {path: DIRS[0], stats: cfs.statSync(DIRS[0])},
      {path: FILES[0], stats: cfs.statSync(FILES[0])},
      {path: DIRS[1], stats: cfs.statSync(DIRS[1])},
      {path: DIRS[2], stats: cfs.statSync(DIRS[2])},
      {path: DIRS[3], stats: cfs.statSync(DIRS[3])},
      {path: FILES[1], stats: cfs.statSync(FILES[1])},
      {path: FILES[2], stats: cfs.statSync(FILES[2])}
    ]
    const items = fs.klawSync(TEST_DIR, {fs: cfs})
    expect(items.length).toEqual(paths.length)
    items.forEach((p, i) => {
      expect(p).toEqual(paths[i])
    })
  })

  it('should return only files if opts.nodir is true', () => {
    const filesOnly = [
      {path: FILES[0], stats: cfs.statSync(FILES[0])},
      {path: FILES[1], stats: cfs.statSync(FILES[1])},
      {path: FILES[2], stats: cfs.statSync(FILES[2])}
    ]
    const files = fs.klawSync(TEST_DIR, {nodir: true, fs: cfs})
    expect(files.length).toEqual(filesOnly.length)
    files.forEach((f, i) => {
      expect(f).toEqual(filesOnly[i])
    })
  })

  it('should return only dirs if opts.nofile is true', () => {
    const dirsOnly = [
      {path: DIRS[0], stats: cfs.statSync(DIRS[0])},
      {path: DIRS[1], stats: cfs.statSync(DIRS[1])},
      {path: DIRS[2], stats: cfs.statSync(DIRS[2])},
      {path: DIRS[3], stats: cfs.statSync(DIRS[3])}
    ]
    const dirs = fs.klawSync(TEST_DIR, {nofile: true, fs: cfs})
    expect(dirs.length).toEqual(dirsOnly.length)
    dirs.forEach((dir, i) => {
      expect(dir).toEqual(dirsOnly[i])
    })
  })

  describe('when opts.filter is true', () => {
    it('should filter based on path', () => {
      const f1 = path.join(TEST_DIR, 'foo.js')
      const f2 = path.join(TEST_DIR, 'bar.js')
      cfs.writeFileSync(f1, 'f1 file')
      cfs.writeFileSync(f2, 'f2 file')
      const paths = [{path: f1, stats: cfs.statSync(f1)}]
      const filterFunc = i => path.basename(i.path).indexOf('foo') > -1
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc, fs: cfs})
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })

    it('should filter but not recurse if noRecurseOnFailedFilter is true', () => {
      const dirToIgnore1 = path.join(TEST_DIR, 'node_modules')
      const dirToIgnore2 = path.join(dirToIgnore1, 'somepkg')
      cfs.mkdirpSync(dirToIgnore2)
      const paths = [
        {path: DIRS[0], stats: cfs.statSync(DIRS[0])},
        {path: FILES[0], stats: cfs.statSync(FILES[0])},
        {path: DIRS[1], stats: cfs.statSync(DIRS[1])},
        {path: DIRS[2], stats: cfs.statSync(DIRS[2])},
        {path: DIRS[3], stats: cfs.statSync(DIRS[3])},
        {path: FILES[1], stats: cfs.statSync(FILES[1])},
        {path: FILES[2], stats: cfs.statSync(FILES[2])}
      ]
      const filterFunc = i => i.path.indexOf('node_modules') < 0
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc, noRecurseOnFailedFilter: true, fs: cfs})
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })

    it('should filter when it is used to ignore items', () => {
      const dirToIgnore1 = path.join(TEST_DIR, 'node_modules')
      const dirToIgnore2 = path.join(TEST_DIR, '.git')
      cfs.mkdirpSync(dirToIgnore1)
      cfs.mkdirpSync(dirToIgnore2)
      const paths = [
        {path: DIRS[0], stats: cfs.statSync(DIRS[0])},
        {path: FILES[0], stats: cfs.statSync(FILES[0])},
        {path: DIRS[1], stats: cfs.statSync(DIRS[1])},
        {path: DIRS[2], stats: cfs.statSync(DIRS[2])},
        {path: DIRS[3], stats: cfs.statSync(DIRS[3])},
        {path: FILES[1], stats: cfs.statSync(FILES[1])},
        {path: FILES[2], stats: cfs.statSync(FILES[2])}
      ]
      const filterFunc = i => i.path.indexOf('node_modules') < 0 && i.path.indexOf('.git') < 0
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc, noRecurseOnFailedFilter: true, fs: cfs})
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })

    it('should filter and apply opts.nofile', () => {
      const f = path.join(TEST_DIR, 'foo.js')
      const d1 = path.join(TEST_DIR, 'foo')
      const d2 = path.join(TEST_DIR, 'foobar')
      cfs.writeFileSync(f, 'file contents')
      cfs.mkdirpSync(d1)
      cfs.mkdirpSync(d2)
      const paths = [
        {path: d1, stats: cfs.statSync(d1)},
        {path: d2, stats: cfs.statSync(d2)}
      ]
      const filterFunc = i => i.path.indexOf('foo') > 0
      const items = fs.klawSync(TEST_DIR, {filter: filterFunc, nofile: true, fs: cfs})
      expect(items.length).toEqual(paths.length)
      items.forEach((p, i) => {
        expect(p).toEqual(paths[i])
      })
    })
  })
})
