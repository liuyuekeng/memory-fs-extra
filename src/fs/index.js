const MemoryFs = require('@liuyuekeng/memory-fs');
const fromCallback = require('universalify').fromCallback;

const api = [
    'access',
    'appendFile',
    'chmod',
    'chown',
    'close',
    'copyFile',
    'fchmod',
    'fchown',
    'fdatasync',
    'fstat',
    'fsync',
    'ftruncate',
    'futimes',
    'lchown',
    'lchmod',
    'link',
    'lstat',
    'mkdir',
    'mkdtemp',
    'open',
    'readFile',
    'readdir',
    'readlink',
    'realpath',
    'rename',
    'rmdir',
    'stat',
    'symlink',
    'truncate',
    'unlink',
    'utimes',
    'writeFile'
].filter(key => {
    // Some commands are not available on some systems. Ex:
    // fs.copyFile was added in Node.js v8.5.0
    // fs.mkdtemp was added in Node.js v5.10.0
    // fs.lchown is not available on at least some Linux
    return typeof MemoryFs.prototype[key] === 'function'
});

api.forEach(method => {
    exports[method] = fromCallback(MemoryFs.prototype[method]);
})

exports._statSync = MemoryFs.prototype.statSync;
// add size to file`s stats
exports.statSync = function (path) {
    let fs = this
    let stats = this._statSync(path)
    if (stats.isFile()) {
        stats.size = fs.meta(path).length
    }
    return stats
}

exports.stat = fromCallback(function (path, callback) {
    let fs = this
    let res
    try {
        fs.statSync(path)
    } catch (e) {
        setImmediate(function () {
            callback(e)
        })
        return
    }
    setImmediate(function () {
        callback(null, res)
    })
})

// fs.read() & fs.write need special treatment due to multiple callback args
exports.read = function (fd, buffer, offset, length, position, callback) {
    if (typeof callback === 'function') {
        return MemoryFs.prototype.read(fd, buffer, offset, length, position, callback)
    }
    return new Promise((resolve, reject) => {
        MemoryFs.prototype.read(fd, buffer, offset, length, position, (err, bytesRead, buffer) => {
            if (err) return reject(err)
            resolve({ bytesRead, buffer })
        })
    })
}

// Function signature can be
// fs.write(fd, buffer[, offset[, length[, position]]], callback)
// OR
// fs.write(fd, string[, position[, encoding]], callback)
// We need to handle both cases, so we use ...args
exports.write = function (fd, buffer, ...args) {
    if (typeof args[args.length - 1] === 'function') {
        return MemoryFs.prototype.write(fd, buffer, ...args)
    }
    return new Promise((resolve, reject) => {
        MemoryFs.prototype.write(fd, buffer, ...args, (err, bytesWritten, buffer) => {
            if (err) return reject(err)
            resolve({ bytesWritten, buffer })
        })
    })
}
