# node-fs-extension
Node Module to extends nodeJS 'fs'

## Install
```bash
npm i node-fs-extension
```

## Brief
```js
const fs = require('fs')
fs.extras = {
    exists,
    existsSync,
    statSync,
    lstatSync,
    mkdir,
    rm,
    copy,
    symlink,
    find,
    readJsonSync,
    writeJsonSync,
}
module.exports = fs
```

# fs.extras
## Files tests
```js
/**
 * Tests whether a given path exists or not
 * @param {string | Buffer | URL } path 
 * @param {'folder' | 'file' | 'any'} [type] default is 'any'
 */
async function exists(path, type) {}
```
```js
/**
 * Tests whether a given filename exists or not
 * @param {string | Buffer | URL } filename 
 * @param {'folder' | 'file' | 'any'} [type] default is 'any'
 */
function existsSync(filename, type) {}
```
```js
/**
 * same fs.statSync excepts, it wouldn't throw if path don't exists
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 */
function statSync(file) {}
```
```js
/**
 * same fs.lstatSync excepts, it wouldn't throw if path don't exists
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 */
function lstatSync(file) {}
```
## Copy/Delete files
```js
/**
 * mkdir - create a directory in recursive mode.
 * @param {string} path 
 */
async function mkdir(path) {}
```
```js
/**
 * Remove recursively files or folders
 * @param {string} base 
 * @param {function | string | RegExp} [filter]
 * @example
 *  await rm('./lib') // remove all
 *  await rm('./lib', '*.js') // remove all js files
 *  await rm("./lib/", /.js$/)  // remove all js files
 *  await rm('./lib', (file, lstat) => /.js$/.test(file))
 *  await rm('./lib', './lib/*.js') // none-recursive glob expr
 *  await rm('./lib', '*.+(bar|foo)') // advanced glob expr
 */
async function rm(path, filter) {}
```
```js
/**
 * Copy recursively files or folders
 * @param src A path to the source file.
 * @param dest A path to the destination file.
 * @param flags An optional integer that specifies the behavior of the copy operation. The only
 * supported flag is `fs.constants.COPYFILE_EXCL`, which causes the copy operation to fail if
 * `dest` already exists.
 */
async function copy(src, dest, flags) {}
```
```js
/**
 * Create a symlink 'junction'
 * @param src A path to the source file (also nammed target of symlink).
 * @param dest A path to a new symlink file to create.
 * @param flags An optional integer that specifies the behavior of the symlink operation. The only
 * supported flag is `fs.constants.COPYFILE_EXCL`, which causes the symlink operation to fail if
 * `dest` already exists and don't already pointed to the right target.
 */
async function symlink(src, dest, flags) {}
```
## Find
```js
/**
 * Find a files or folders
 * @param {string} base 
 * @param {function | string | RegExp} [filter]
 * @param {{files: boolean, folders: boolean, followSymbolicLinks: boolean, depth: number}} [options]
 * @example
 * await find("./lib/") // all contents (recursive search)
 * await find("./lib/", {folders: false}) // all files (recursive search)
 * await find("./lib/", {folders: false, depth: 0}) // all files (non-recursive search)
 * await find('./lib', '*.js') // all js files
 * await find("./lib/", /.js$/) // all js files
 * await find('./lib', (file, lstat) => /.js$/.test(file)) // all js files
 * await find('./lib', '*.js', {depth: 0}) // non-recursive search
 * await find('./lib', './lib/*.js') //  non-recursive
 * await find('./lib', '*.+(bar|foo)') // advanced glob expr
 * await find("./lib/README.md") // ['/absolute/lib/README.md']
 * await find("./lib/notexist") // [] 
 */
async function find(base, filter, options) {}
```
## Json
```js
/**
 * Rely on readFileSync to get js Object
 * @param filename Json path
 */
function readJsonSync(filename) {}
/**
 * Rely on writeJsonSync to write js Object
 * @param filename Json path
 * @param obj js object
 */
function writeJsonSync(filename, obj) {}
```

# Examples
```js
const fs = require('node-fs-extension')

// regular 'fs' is preserved
await fs.writeFileSync("./src/test.txt", "Hello world")

// extensions cames as 'extras'
await fs.extras.mkdir("./foo/bar/baz")
await fs.extras.rm("./foo")
await fs.extras.copy("./src", "./dest", fsEx.constants.COPYFILE_EXCL)
await fs.extras.rm("./dest", "*.txt")
console.log(await fs.extras.find("./node_modules/micromatch/", "*.js")))
```

