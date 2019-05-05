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
        this.json = {} // flat (merged version) of packages.json
        this._tree = [] // Array<{filename, children[], json}> tree of original packages.json 
        this.commands = new Commands(this) // List of found commands
        this.commandsPathSet = new Set() // ...to avoid re-entrance
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
        this.json = objectBool.or(item.json, this.json)
        if (this.json.extends) delete this.json.extends
        // add potential commands laying in current direction
        if (!this.commandsPathSet.has(cwd)) {
            // ------------
            // Note:
            // This 'commandsPathSet' allows to avoid multiple call to require() 
            // on the same file/path (require() is acutally hidden inside addFromPath())
            //
            // That's say, natively require() already do that !
            // which would make this code completly useless.
            // 
            // However if some errors occurs during require()
            // this is no more true. So in order to keep error logs readable
            // we actually still need this re-entrance check
            // ------------
            this.commandsPathSet.add(cwd)
            this.commands.addFromPath(cwd)
        }
        // add potential commands coming from package.json scripts
        this.commands.addFromScripts(item.json && item.json.scripts)
    }

    get root() { return this._tree[0] }

    async start() {
         if (this.root.json) fs.extras.writeJsonSync(this.root.filename, this.json)
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
