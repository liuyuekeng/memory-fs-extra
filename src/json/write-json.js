'use strict'
const jsonFile = require('jsonfile');
const fromCallback = require('universalify').fromCallback

function writeJsonSync(file, obj, options) {
    let fs = this;
    options = options || {};
    options.fs = options.fs || fs;
    return jsonFile.writeFileSync(file, obj, options);
}

const writeJson = fromCallback(function readJson(file, obj, options, callback) {
    let fs = this;
    if (callback == null) {
        callback = options
        options = {}
    }

    options = options || {}
    options.fs = options.fs || fs;

    return jsonFile.writeFile(file, obj, options, callback);
});

module.exports = {
    writeJson,
    writeJsonSync
}