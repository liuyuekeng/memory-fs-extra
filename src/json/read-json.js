'use strict'
const jsonFile = require('jsonfile');
const fromCallback = require('universalify').fromCallback

function readJsonSync(file, options) {
    let fs = this;
    options = options || {}
    if (typeof options === 'string') {
        options = { encoding: options }
    }
    options.fs = options.fs || fs;
    return jsonFile.readFileSync(file, options);
}

const readJson = fromCallback(function readJson(file, options, callback) {
    let fs = this;
    if (callback == null) {
        callback = options
        options = {}
    }
    if (typeof options === 'string') {
        options = { encoding: options }
    }
    options = options || {}
    options.fs = options.fs || fs;
    return jsonFile.readFile(file, options, callback);
});

module.exports = {
    readJson,
    readJsonSync
}