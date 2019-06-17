const MemoryFs = require('@liuyuekeng/memory-fs');

class MemoryFsExtra extends MemoryFs {
}

Object.assign(MemoryFsExtra.prototype,
    // Export promiseified memory-fs:
    require('./fs'),
    // Export extra methods:
    require('./copy-sync'),
    require('./copy'),
    require('./empty'),
    require('./ensure'),
    require('./json'),
    require('./klaw-sync'),
    require('./mkdirs'),
    require('./move-sync'),
    require('./move'),
    require('./output'),
    require('./path-exists'),
    require('./remove')
)

module.exports = MemoryFsExtra;