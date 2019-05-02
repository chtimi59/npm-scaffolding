'use strict'
const fs = require('fs')
const path = require('path')
const exeToStdOut = require('node-child-process-extension').extras.exeToStdOut

/**
 * Tests whether a given filename exists or not
 * @param {string | Buffer | URL } filename 
 * @param {'folder' | 'file' | 'any'} [type] default is 'any'
 */
async function exists(filename, type) {
    return new Promise((resolve, reject) => {
        fs.stat(filename, (e, v) => {
            if (e) return resolve(false)
            if (!type || type === 'any') return resolve(true)
            if (type === 'folder') return resolve(v.isDirectory())
            if (type === 'file') return resolve(v.isFile())
            return reject(new TypeError(`Type '${type}' unknown`))
        })
    })
}

/**
 * same fs.statSync execpts, it wouldn't throw if path don't exists
 * @param path A path to a file. If a URL is provided, it must use the `file:` protocol.
 */
function statSync(file) {
    try {
        return fs.statSync(file)
    } catch(e) {
        return new fs.Stats()
    }
}

/**
 * mkdir - create a directory in recursive mode.
 * @param {string} dirpath 
 */
async function mkdir(dirpath) {
    if (await exists(dirpath, 'folder')) return
    return new Promise((resolve, reject) => {
        fs.mkdir(dirpath, { recursive: true }, e => {
            if (e) return reject(e)
            resolve()
        })
    })
}

/**
 * Find a files or folders
 * @param {string} base 
 * @param {function | string | RegExp} [filter]
 * @param {{files: boolean, folders: boolean, depth: number}} [options]
 */
async function find(base, filter, options) {
    // private arguments (for recursive call)
    const item = arguments[3] 
    const currentDepth = arguments[4] ? arguments[4] : 0
    const abs = item ? path.resolve(base, item) : path.resolve(base)
    let stat
    try {
        stat = await fs.promises.stat(abs)
    } catch(e) {
        return [] // do not exists
    }
    
    // If only 2 args, then the nature of the second can be 'filter' or 'options'
    if (arguments.length === 2) {
        // by default 2nd argument is filter
        if (typeof filter === 'object' && !(filter instanceof RegExp)) {
            options = filter
            filter = undefined
        }
    }

    // Default options
    options = {
        files: true,
        folders: true,
        depth: Infinity,
        ...options
    }

    // Filter tests
    let test = () => true
    do {
        if (!filter) {
            break
        }
        if (typeof filter === 'function') {
            test = function(file, stat) {
                let ret = filter(file, stat)
                if (ret === undefined) ret = true
                return ret
            }
            break
        }
        if (typeof filter === 'string') {
            test = function(file, stat) {
                const absolute = file ? path.resolve(base, file) : path.resolve(base)
                const filterBase = stat.isFile() ? path.dirname(absolute) : absolute
                const isAbsoluteFilter = (path.sep === '\\' ? /^[a-zA-Z]\:/ : /^\//).test(filter) || filter[0] === '.'
                const search = isAbsoluteFilter ? path.resolve(filter) : path.join(filterBase, filter)
                return require('node-fs-extension/node_modules/minimatch')(absolute, search)
            }
            break
        }
        if (filter instanceof RegExp) {
            test = function(file, stat) {
                console.log(file)
                return file ? filter.test(file) : false
            }
            break
        }
        throw(new TypeError("Invalid filter type, <undefined> | <function> | <string> | RegExp expected"))
    } while(0)
    
    let out = []
    
    if (stat.isFile()) {
        if (options.files && test(item, stat)) out.push(abs)
    }
    if (stat.isDirectory()) {
        if (options.folders && test(item, stat)) out.push(abs)
        if (currentDepth <= options.depth) {
            for (let subitem of await fs.promises.readdir(abs)) {
                if (item) subitem = path.join(item, subitem)
                out = out.concat(...await find(base, filter, options, subitem, currentDepth+1))
            }
        }
    }
    
    return out
}

/**
 * Remove recursively files or folders
 * @param {string} base 
 * @param {function | string | RegExp} [filter]
 */
async function rm(base, filter) {
    const wait = ms => new Promise(r => setTimeout(r, ms))
    const list = await find(base, filter)
    list.reverse()
    for(const absPath of list) {
        const stat = await fs.promises.stat(absPath)
        let lastError = null
        for(let retry=0; retry<5; retry++) {
            try {
                if (stat.isDirectory()) await fs.promises.rmdir(absPath)
                if (stat.isFile()) await fs.promises.unlink(absPath)
                lastError = null
                break // done
            } catch(e) {
                lastError = e
                await wait(1000)
            }
        }
        if (lastError) throw(lastError)
    }
}

/**
 * Copy recursively files or folders
 * @param src A path to the source file.
 * @param dest A path to the destination file.
 * @param flags An optional integer that specifies the behavior of the copy operation. The only
 * supported flag is `fs.constants.COPYFILE_EXCL`, which causes the copy operation to fail if
 * `dest` already exists.
 */
async function copy(src, dest, flags) {
    const list = await find(src, async function(file, state) {
        const s = file ? path.resolve(src, file) : src
        const d = file ? path.resolve(dest, file) : dest
        if (state.isDirectory()) await mkdir(d)
        if (state.isFile()) await fs.promises.copyFile(s, d, flags)
    })
    if (list.length === 0) throw(new Error(`'${src}' not found`))
}

/**
 * Rely on readFileSync to get js Object
 * @param filename Json path
 */
function readJsonSync(filename) {
    return JSON.parse(fs.readFileSync(filename))
}

/**
 * Rely on writeJsonSync to write js Object
 * @param filename Json path
 * @param obj js object
 */
function writeJsonSync(filename, obj) {
    fs.writeFileSync(filename, JSON.stringify(obj, null, 2) + '\n')
}

/**
 * returns the symbolic link of a package name, defined globally
 * typical case: npm link
 * @param {string} packageName
 */
async function readPackageLink(packageName) {
    // get global node_modules
    const globalPrefix = await exeToStdOut(null, `npm prefix -g`)
    const filename = path.join(globalPrefix, 'node_modules', packageName)
    // read Symbolic link
    return fs.readlinkSync(filename)
}

fs.extras = {
    exists,
    mkdir,
    rm,
    find,
    copy,
    statSync,
    readJsonSync,
    writeJsonSync,
    readPackageLink
}

module.exports = fs
