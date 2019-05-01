'use strict'
const fs = require('node-fs-extension')
const path = require('path')
const diffs = require('./diffs')
const merge = require('./merge')
const Commands = require('./commands')
const Dependencies = require('./Dependencies')

function isFileExistSync(file) {
    try {
        return fs.statSync(file).isFile()
    } catch(e) {
        return false
    }
}

class Packages {

    constructor(packageFile) {
        this.packageFile = path.resolve(packageFile)
        this.cwd = path.dirname(this.packageFile)
        this.exist = isFileExistSync(this.packageFile)
        this.original = this.exist ? require(this.packageFile) : {}
        this._load()
    }

    _load() {
        this.dependencies = new Dependencies(this)
        this.commands = new Commands(this)

        // default built-in command (maybe overwrite)
        this.commands.addFromPath(path.join(__dirname, '..'))

        const listToMerge = []
        const read = (filename, exist) => {
            const cwd = path.dirname(filename)
            const json = exist ? require(filename) : null
            this.commands.addFromPath(cwd)
            this.commands.addFromScripts(cwd, json && json.scripts)
            this.dependencies.addFromPackages(cwd, json)
            if (json) {
                listToMerge.push(json)
                if (json.extends) {
                    // recursive call
                    const subFile = path.resolve(path.dirname(filename), json.extends)
                    const subExist = isFileExistSync(subFile, subExist)
                    if (!subExist) console.error(`Warning: '${subFile}' do not exists`)
                    read(subFile, subExist)
                }
            }
        }
        // read user package.json and potentially recursivly 'extends'
        read(this.packageFile, this.exist)
        // merge jsons (ends by root package.json)
        listToMerge.reverse()
        this.json = listToMerge.reduce((a, c) => merge(a, c), {})
    }
    async start() {
        if (!this.exist) return
        fs.extras.writeJsonSync(this.packageFile, this.json)
    }

    async stop() {
        const existNow = isFileExistSync(this.packageFile)
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
            const current = require(this.packageFile)
            const changes = diffs.get(this.json, current)
            this.original = diffs.apply(this.original, changes)
            this.exist = existNow
            this._load()
            fs.extras.writeJsonSync(this.packageFile, this.original)
            return
        }
    }
}

module.exports = Packages
