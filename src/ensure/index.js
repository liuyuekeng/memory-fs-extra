const file = require('./file');

module.exports = {
    createFileSync: file.createFileSync,
    createFile: file.createFile,
    ensureFileSync: file.ensureFileSync,
    ensureFile: file.ensureFile
}