const readJson = require('./read-json');
const writeJson = require('./write-json');
const outputJson = require('./output-json');

module.exports = {
  readJson: readJson.readJson,
  readJSON: readJson.readJson,
  readJsonSync: readJson.readJsonSync,
  readJSONSync: readJson.readJsonSync,
  writeJson: writeJson.writeJson,
  writeJSON: writeJson.writeJson,
  writeJsonSync: writeJson.writeJsonSync,
  writeJSONSync: writeJson.writeJsonSync,
  outputJson: outputJson.outputJson,
  outputJSON: outputJson.outputJson,
  outputJsonSync: outputJson.outputJsonSync,
  outputJSONSync: outputJson.outputJsonSync,
};