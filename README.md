# memory-fs-extra

Just like what node-fs-extra did to fs, it extends memory-fs, with some little diff

## mkdirp, mkdirs, ensureDir, mkdirpSync, mkdirsSync, ensureDirSync
Base on the origin meth 'mkdirp' in property of memoryFs, and it dose not support options

## copy
do not support filter fn which return a promise