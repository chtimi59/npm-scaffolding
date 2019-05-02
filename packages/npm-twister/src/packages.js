'use strict'
const fs = require('node-fs-extension')
const path = require('path')
const objectBool = require('./object-bool')
const Commands = require('./commands')
const Dependencies = require('./Dependencies')

class Packages {


    constructor(packageFile) {
        this.packageFile = path.resolve(packageFile)
        this.cwd = path.dirname(this.packageFile)
        this.exist = fs.extras.statSync(this.packageFile).isFile()
        this.original = this.exist ? require(this.packageFile) : {}
        this._load()
    }
    _load() {
        this.dependencies = new Dependencies(this)
        this.commands = new Commands(this)

        const listToMerge = []
        const read = (filename, exist) => {
            const cwd = path.dirname(filename)
            const json = exist ? require(filename) : null
            this.commands.addFromPath(cwd)
            this.commands.addFromScripts(json && json.scripts)
            this.dependencies.addFromPackages(cwd, json)
            if (json) {
                listToMerge.push(json)
                if (json.extends) {
                    // recursive call
                    const subFile = path.resolve(path.dirname(filename), json.extends)
                    const subExist = fs.extras.statSync(subFile).isFile()
                    if (!subExist) console.error(`Warning: '${subFile}' do not exists`)
                    read(subFile, subExist)
                }
            }
        }
        // read user package.json and potentially recursivly 'extends'
        read(this.packageFile, this.exist)
        // merge jsons (ends by root package.json)
        listToMerge.reverse()
        this.json = listToMerge.reduce((a, c) => objectBool.or(a, c), {})
    }
    async start() {
        if (!this.exist) return
        fs.extras.writeJsonSync(this.packageFile, this.json)
    }

    async stop() {
        const existNow = fs.extras.statSync(this.packageFile).isFile()
        // has been removed
        if (!existNow) {
            this.original = {}
            this.exist = existNow
            this._load()
            return
        }
        // has been added
        if (!this.exist && existNow) {
            this.original = require(this.packageFile)
            this.exist = existNow
            this._load()
            return
        }
        // has been changed
        if (this.exist && existNow) {
            const current = fs.extras.readJsonSync(this.packageFile)
            // reflects changes into 'this.original'
            const added = objectBool.hxor(current, this.json)
            const removed = objectBool.hxor(this.json, current)
            this.original = objectBool.or(added, objectBool.remove(removed, this.original))
            this.exist = existNow
            this._load()
            fs.extras.writeJsonSync(this.packageFile, this.original)
            return
        }
    }
}

module.exports = Packages
