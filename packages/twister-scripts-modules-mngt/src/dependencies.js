'use strict'
const fs = require('fs')
const path = require('path')
const semver = require('semver')

const Operations = require('./operations')

const Sections = [
    'dependencies',
    'devDependencies',
    'peerDependencies',
    'optionalDependencies',
    'operationDependencies'
]

class Dependencies {

    constructor(packages) {
        this._list = []
        this.addFromPackages(packages.root)
        this.nodemodulePath = path.resolve(path.dirname(packages.root.filename), "node_modules")
        //
        // this._list is an array of 
        //
        //      {
        //              name, -- module name
        //              section, -- devDependency | peerDependenc ...
        //              semver, -- module semver range
        //              op?, arg? -- if it's an operation
        //      }
        //
        
    }

    // Add Dependencies from packageJson object
    addFromPackages(packages) {
        if (packages.json === null) return
        const cwd = path.resolve(path.dirname(packages.filename))
        const sections = Sections.filter(section => packages.json[section])
        sections.forEach(section => {
            for (const [name, value] of Object.entries(packages.json[section])) {
                const error = this.add(cwd, section, name, value)
                if (error) console.error(error)
            }
        })
        for(const p of packages.children) {
            this.addFromPackages(p)
        }
    }

    // Add a Dependency
    add(cwd, section, name, value) {
        if (!cwd || typeof cwd !== 'string') throw(new Error('cwd should be a <string> (non-empty)'))
        if (!name || typeof name !== 'string') throw(new Error('name should be a <string> (non-empty)'))
        if (!value || typeof value !== 'string') throw(new Error('value should be a <string> (non-empty)'))
        if (!section || typeof section !== 'string') throw(new Error('section should be a <string> (non-empty)'))

        cwd = path.resolve(cwd)

        // value is regular package semver >
        if (semver.validRange(value)) {
            this._list.push({cwd, name, section, semver: value})
            return
        }
        // value is "operation arguments" string ?
        const arr = value.trim().match(/^([^\s\d\^\?\$]+)\s*(.*)/)
        if (arr) {
            const op = arr[1]
            const arg = arr[2]
            if (Operations[op] === undefined) {
               return `Unknown operation '${op}'`
            }
            if (!Operations[op].test(arg)) {
                return `Invalid or missing argument '${op} ${arg}'`
            }
            const arrArgs = arg.split(' ').filter(v => !!v)
            this._list.push({cwd, name, section, semver: '*', op, arg: arrArgs})
            return
        }
        return `unknown value <type> for '${name}' package`
    }

    // do operationDependencies operations
    async doOperations() {
        const list = this._list.filter(o => o.section === 'operationDependencies')
        for(const item of list) {
            const obj = {
                nodemodulePath: this.nodemodulePath,
                currentDirPath: item.cwd,
                moduleName: item.name,
                arguments: item.arg
            }
            try {
                await Operations[item.op].run(obj)
            } catch(e) {
                console.error(`error: operationDependencies[${item.name}] failed`)
                console.error(obj)
                console.error()
                console.error(e)
                console.error()
            }
        }
    }

    // remaining dependencies that need to be installed or removed
    todo() {
        let add = this.required.map(f => path.resolve(this.nodemodulePath, f))
        let rm = this.unexpected.map(f => path.resolve(this.nodemodulePath, f))
        add = add.filter(filename => !rm.includes(filename) && !fs.existsSync(filename))
        rm = rm.filter(filename => fs.existsSync(filename))
        return {add, rm}
    }

    // return an array of required dependencies
    get required() {
        return Array.from(this._list.reduce((out, m) => {
            if (m.section === 'optionalDependencies') {
                return out
            }
            if (m.semver) {
                out.add(m.name)
                return out
            }
            if (m.op !== 'rm') {
                out.add(m.name)
                return out
            }
            return out
        }, new Set()))
    }

    // return an array of unexpected dependencies
    get unexpected() {
        return Array.from(this._list.reduce((out, m) => {
            if (m.op === 'rm') {
                out.add(m.name)
                return out
            }
            if (m.op === 'rename') {
                out.add(m.arg[0])
                return out
            }
            return out
        }, new Set()))
    }
}

module.exports = Dependencies
