'use strict'
const path = require('path')
const fs = require('fs')

module.exports = {
    split,
    commonAncestor,
    relativePath,
    walkSync,
    toPosix
}

/* Split a path into an array */
function split(p) {
    if (!p) return []
    const arr = p.split(path.sep)
    if (arr.length === 0) return [];
    return arr.map(i => i.trim()).filter(i => !!i)
}

/* Find commmon ancestor between 2 paths */
function commonAncestor(pathA, pathB) {
    // make sure there are absolute
    if (pathA) pathA = path.resolve(pathA) 
    if (pathB) pathB = path.resolve(pathB)
    if (!pathA) return pathB
    if (!pathB) return pathA
    let cnt = 0 // nb of common ancestor
    const a = split(pathA)
    const b = split(pathB)
    /* max common ancestor is defined by the shortest path */
    const max = a.length < b.length ? a.length : b.length
    /* nb of actual common ancestor */
    for (cnt = 0; cnt < max; cnt++) if (a[cnt] !== b[cnt]) break
    /* rebuild path */
    const ancestor = a.slice(0, cnt)
    if (ancestor.length < 1) return null
    return path.join(...ancestor)
}

/* Get a a Relative path from a path */
function relativePath(rootPath, pathA, allowDoubleDot = false, debug = false) {
    // make sure there are absolute
    if (!rootPath) return path
    if (!path) return ""
    rootPath = path.resolve(rootPath) 
    pathA = path.resolve(pathA)
    const base = commonAncestor(rootPath, pathA)
    if (base === rootPath) {
        if (debug) {
            console.log(`----`)
            console.log(pathA)
            console.log(base)
        }
        return path.join(...split(pathA.substring(base.length)))
    } else {
        if (!allowDoubleDot) return null
        const len = split(base).length
        const a = split(pathA).slice(len)
        let doubleDotCount = split(rootPath).length - len
        const out = []
        for (let i = 0; i < doubleDotCount; i++) { out.push("..") }
        return path.join(...out.concat(a))
    }
}

/* recursive list a of directory */
function walkSync(dir) {
    let output = []
    const files = fs.readdirSync(dir)
    for(let file of files) {
        file = path.join(dir, file)
        if (fs.statSync(file).isDirectory()) {
            output = output.concat(walkSync(file))
        } else {
            output.push(file);
        }
    }
    return output
}

/* convert \ to / */
function toPosix(dir) {
    if (path.sep === '/') return dir
    return dir.replace(/\\/g, "/")
}
