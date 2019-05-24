# node-fs-extension
Node Module to extends nodeJS 'fs'

```js
const fs = require('fs')
fs.extras = {
    exists,
    existsSync,
    mkdir,
    rm,
    find,
    copy,
    statSync,
    readJsonSync,
    writeJsonSync,
    symlink
}
module.exports = fs
```

## 'extras' API
```js
/**
 * Tests whether a given path exists or not
 * @param {string | Buffer | URL } path 
 * @param {'folder' | 'file' | 'any'} [type] default is 'any'
 */
async function exists(path, type) {}

/**
 * Tests whether a given filename exists or not
 * @param {string | Buffer | URL } filename 
 * @param {'folder' | 'file' | 'any'} [type] default is 'any'
 */
function existsSync(filename, type) {}

/**
 * same fs.statSync excepts, it wouldn't throw if path don't exists
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 */
function statSync(file) {}

/**
 * mkdir - create a directory in recursive mode.
 * @param {string} path 
 */
async function mkdir(path) {}

/**
 * Find a files or folders
 * 
 * @param {string} base 
 * @param {function | string | RegExp} [filter]
 * @param {{files: boolean, folders: boolean, depth: number}} [options]
 */
async function find(base, filter, options) {}

/**
 * Remove recursively files or folders
 * @param {string} path 
 * @param {function | string | RegExp} [filter]
 */
async function rm(path, filter) {}

/**
 * Copy recursively files or folders
 * @param src A path to the source file.
 * @param dest A path to the destination file.
 * @param flags An optional integer that specifies the behavior of the copy operation. The only
 * supported flag is `fs.constants.COPYFILE_EXCL`, which causes the copy operation to fail if
 * `dest` already exists.
 */
async function copy(src, dest, flags) {}

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

### "find" specifics examples:
```js
const fs = require('node-fs-extension')

// 1- returns [./node_modules/micromatch/README.md]
console.log(await fs.extras.find("./node_modules/micromatch/README.md"))
// 2- return []
console.log(await fs.extras.find("./node_modules/micromatch/notexist"))

// 3- return list of files and folders (recursive)
console.log(await fs.extras.find("./node_modules/micromatch/"))
// 4- return list of files (recursive)
console.log(await fs.extras.find("./node_modules/micromatch/", {folders: false}))

// 5- all those 3, are identical and returns all '.js' files
console.log(await fs.extras.find("./node_modules/micromatch/", "*.js"))
console.log(await fs.extras.find("./node_modules/micromatch/", "./node_modules/micromatch/**/*.js"))
console.log(await fs.extras.find("./node_modules/micromatch/", "F:\\dev\\plasma\\Extras\\io.js\\node_modules\\micromatch\\**\\*.js"))

// 6- all those 2, are identical and returns all '.js' files in a specific folder
console.log(await fs.extras.find("./node_modules/micromatch/", "*.js", {depth: 0}))
console.log(await fs.extras.find("./node_modules/micromatch/", "./node_modules/micromatch/*.js"))

// 7- returns all files that have "i" in their path (like 'index.js' or 'lib/parsers.js')
// note: base part ('./node_modules/micromatch/') is not used by the regular expression test
console.log(await fs.extras.find("./node_modules/micromatch/", /i/, {folders: false}))
```

## Examples
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

