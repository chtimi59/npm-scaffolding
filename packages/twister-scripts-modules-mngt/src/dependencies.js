'use strict'
const fs = require('node-fs-extension')
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
        this.packages = packages
        this.nodemodulePath = path.resolve(this.packages.cwd, "node_modules")
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
        this._list = []
    }

    // Add Dependencies from packageJson object
    addFromPackages(cwd, packageJson = null) {
        if (!packageJson) return
        const sections = Sections.filter(section => packageJson[section])
        sections.forEach(section => {
            for (const [name, value] of Object.entries(packageJson[section])) {
                this.add(cwd, section, name, value)
            }
        })
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
            this._list.push({cwd, name, section, semver: '*', op, arg})
            return
        }
        return `unknown value <type> for '${name}' package`
    }

    // do operationDependencies operations
    async doOperations() {
        const list = this._list.filter(o => o.section === 'operationDependencies')
        for(const item of list) {
            const target = path.resolve(this.nodemodulePath, item.name)
            await Operations[item.op].run(item.cwd, target, list.arg)
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
            if (m.op === 'mv') {
                const from = path.resolve(m.cwd, m.arg)
                const name = path.relative(this.nodemodulePath, from)
                if (!name.includes(path.sep)) out.add(name)
                return out
            }
            return out
        }, new Set()))
    }
}

module.exports = Dependencies