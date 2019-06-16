'use strict'
const path = require('path');
const fromCallback = require('universalify').fromCallback;

const createFile = fromCallback(function createFile(file, callback) {
    let fs = this;
    let res;
    try {
        res = fs.createFileSync(file);
    } catch (e) {
        setImmediate(function () {
            callback(e)
        });
        return;
    }
    setImmediate(function () {
        callback(null, res);
    })
});

function createFileSync(file) {
    let fs = this;
    let stats;
    try {
        stats = fs.statSync(file);
    } catch (e) {}
    if (stats && stats.isFile()) return

    const dir = path.dirname(file);
    if (!fs.existsSync(dir)) {
        fs.mkdirpSync(dir);
    }

    fs.writeFileSync(file, new Buffer(0));
}

module.exports = {
    createFileSync,
    ensureFileSync: createFileSync,
    createFile,
    ensureFile: createFile
}