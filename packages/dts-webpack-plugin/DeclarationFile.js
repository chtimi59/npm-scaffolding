'use strict'
const pathEx = require('./pathEx')
const path = require('path')
const fs = require('fs')

class DTripleSlash {
    toString() { return this._raw }
    static test(str) { return str.match(/^\s*\/\/\//) }
    constructor(str) { 
        this._raw = str
        this.hash = this._raw
    }
}

class DModule {
    toString() { return this.from ? `import ${this.what} from "${this.from}"` : this._raw }
    static test(str) { return str.match(/^\s*import/) }
    constructor(str) {
        this._raw = str
        const reg = str.match(/^\s*import\s*(.*)\s*from\s+['"](.+)['"]/)
        if (reg) {
            this.what = reg[1]
            this.from = reg[2]
        }
        this.hash = this._raw
    }
}

class DeclarationFile {

    static get tsconfig() {
        return this._tsconfig
    }
    static set tsconfig(v) {
        this._tsconfig = v
    }

    
    constructor(params) {
        if (!DeclarationFile.tsconfig) throw(new Error("DeclarationFile.tsconfig is undefined"))
        
        params = {
            file: undefined,
            key: undefined,
            assets: {},
            ...params
        }

        this.tripleSlashes = {} //Dict<DTripleSlash>
        this.modules = {} //Dict<DModule>
        this.lines = [] // Lines
        this.assets = params.assets

        let buff = ""
        if (params.file) {
            if (!fs.existsSync(params.file)) throw(new Error(`${params.file} unfound`))
            buff = fs.readFileSync(params.file).toString()
        }
        if (params.key) {
            if (!params.assets[params.key]) throw(new Error(`'${params.key}' is not part of assets`))
            buff = params.assets[params.key].source().toString()
        }
        
        for(let line of buff.split("\n"))
        {
            if (DTripleSlash.test(line)) {
                this.addTripleSlash(line)
                continue
            }
            if (DModule.test(line)) {
                this.addModule(line)
                continue
            }
            this.lines.push(line)
        }
    }

    concat(obj) {
        if (obj instanceof DeclarationFile) { 
            this.addTripleSlash(obj.tripleSlashes)
            this.addModule(obj.modules)
            this.lines = this.lines.concat(obj.lines)
            return
        }
        throw(new Error('Invalid type DeclarationFile expected'))
    }
    
    addTripleSlash(value) {
        const dest = 'tripleSlashes'
        if (typeof(value) === 'string') {
            const obj = new DTripleSlash(value)
            this[dest][obj.hash] = obj
            return
        }
        if (value instanceof DTripleSlash) { 
            const obj = value
            this[dest][obj.hash] = obj
            return
        }
        // multiple values
        if (typeof(value) === 'object') {
            for (const k in value) {
                const obj = value[k]
                if (!(obj instanceof DTripleSlash)) break;
                this[dest][obj.hash] = obj
            }
            return
        }
        throw(new Error('Invalid type String|DTripleSlash|Dict<DTripleSlash> expected'))
    }

    addModule(value) {
        const dest = 'modules'
        if (typeof(value) === 'string') {
            const obj = new DModule(value)
            this[dest][obj.hash] = obj
            return
        }
        if (value instanceof DModule) { 
            const obj = value
            this[dest][obj.hash] = obj
            return
        }
        // multiple values
        if (typeof(value) === 'object') {
            for (const k in value) {
                const obj = value[k]
                if (!(obj instanceof DModule)) break;
                this[dest][obj.hash] = obj
            }
            return
        }
        throw(new Error('Invalid type String|DModule|Dict<DModule> expected'))
    }

    resolveModule(curDir) {
        curDir = path.resolve(curDir)
        for(const hash in this.modules) {
            const obj = this.modules[hash]
            const alias = DeclarationFile.tsconfig.alias(obj.from)
            if (!alias) continue
            const relative = pathEx.relativePath(curDir, alias, true)
            obj.from = pathEx.toPosix(relative)
        }
    }

    replace(searchValue, replaceValue) {
        if (!searchValue) return
        if (!replaceValue) return
        this.lines = this.lines.map(line => line.replace(searchValue, replaceValue))
    }

    toString() {
        let buff = ""
        for (const k in this.tripleSlashes) { buff += `${this.tripleSlashes[k]}\n` }
        for (const k in this.modules) { buff += `${this.modules[k]}\n` }
        buff += this.lines.join('\n')
        return buff
    }

    toAsset() {
        const buff = this.toString()
        return {
            source: () => buff,
            size: () => buff.length
        }
    }
}

module.exports = DeclarationFile
