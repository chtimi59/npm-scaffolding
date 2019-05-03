'use strict'
const fs = require('node-fs-extension')
const path = require('path')
const objectBool = require('./object-bool')
const Commands = require('./commands')

class PackagesTree {

    static singleton(dirname = ".") {
        if (!PackagesTree._singleton) {
            Object.defineProperty(PackagesTree, '_singleton', {
                value: new PackagesTree(dirname),
                enumerable: true
            })
            PackagesTree._singleton._load()
        } else {
            const obj = PackagesTree._singleton
            if (path.resolve(dirname) !== obj.dirname) {
                throw(new Error(`PackagesTree.singleton was initialized with a different base directory: '${obj.dirname}'`))
            }
        }
        return PackagesTree._singleton
    }

    constructor(dirname = ".") {
        Object.defineProperty(this, 'dirname', {
            value: path.resolve(dirname),
            enumerable: true
        })
    }

    _load() {
        this.json = {}
        this.commands = new Commands(this)
        this._tree = []
        this._add(this.dirname)
    }

    _add(filename, tree = this._tree) {
        const stat = fs.extras.statSync(filename)
        if (stat.isDirectory()) filename = path.resolve(filename, "package.json")
        const cwd = path.dirname(filename)
        const exist = fs.extras.statSync(filename).isFile()
        const item = {
            filename,
            children: [],
            json: exist ? require(filename) : null
        }
        if (item.json && item.json.extends) {
            const list = typeof item.json.extends === 'string' ? [item.json.extends] : item.json.extends
            if (!Array.isArray(list)) throw(new Error(`'${filename}' invalid type <extends?: string|string[]> expected`))
            for (const f of list) {
                this._add(path.resolve(cwd, f), item.children)
            }
        }
        tree.push(item)

        // merge jsons
        this.json = objectBool.or(this.json, item.json)
        // add potential commands laying in current direction
        this.commands.addFromPath(cwd)
        // add potential commands coming from package.json scripts
        this.commands.addFromScripts(item.json && item.json.scripts)
    }

    get root() { return this._tree[0] }

    async start() {
         if (this.root.json) fs.extras.writeJsonSync(this.root.filename, this.root.json)
    }

    async stop() {
        let original = this.root.json
        if (fs.extras.statSync(this.root.filename).isFile()) {
            // reflects changes
            const current = fs.extras.readJsonSync(this.root.filename)
            const added = objectBool.hxor(current, this.json)
            const removed = objectBool.hxor(this.json, current)
            original = objectBool.or(added, objectBool.remove(removed, this.root.json))
        }
        if (original) fs.extras.writeJsonSync(this.root.filename, original)
        this._load()
    }
}

module.exports = PackagesTree
