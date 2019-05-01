'use strict'
const fs = require('node-fs-extension')
const path = require('path')

const args = require('./args')

class Commands {

    constructor(packages) {
        this.packages = packages
        //
        // "this._dict" is a dictionnary of 
        //
        //      <name> : {                            -- command name
        //          description?: string              -- command description
        //          help: async function(ctx,...argv) -- function to call if help is requested
        //          main: async function(ctx,...argv) -- function to call to run this command
        //      }
        //
        this._dict = {}
        this._alias = {}
    }

    // Add commands form path
    addFromPath(currentPath) {
        let files
        // may not exist
        try {
            const directory = path.resolve(currentPath, ".scripts")
            files = fs.readdirSync(directory).map(f => path.resolve(directory, f))
        } catch(e) {
            return e.message
        }
        // add commands from files
        files.forEach(this.addFromFilename.bind(this))
    }

    // Add one command from filename (or dirname)
    addFromFilename(filename) {
        if (!filename || typeof filename !== 'string') throw(new Error('filename should be a <string> (non-empty)'))
        const stat = fs.statSync(filename)
        const name = stat.isFile() ? path.basename(filename, '.js') : path.basename(filename)
        const item = require(filename) // support filename and dirname and dirname with package.json
        // may not be a valid command
        try {
            this.add(name, item.main, item.description, item.help, item.alias)
        } catch(e) {
            return e.message
        }
    }

    // Add commands from Package.json scripts section
    addFromScripts(cwd, scripts) {
        if (!scripts) return
        //console.log(scripts)
    }

    // Add one command
    add(name, mainFct, description = undefined, helpFct = undefined, alias=[]) {
        if (!name || typeof name !== 'string') throw(new Error('name should be a <string> (non-empty)'))
        if (!mainFct || typeof mainFct !== 'function') throw(new Error('mainFct should be a <function>'))
        if (description && typeof description !== 'string') throw(new Error('description should be a <string>'))
        if (helpFct && typeof helpFct !== 'function') throw(new Error('helpFct should be a <function>'))
        if (!helpFct && description) helpFct = () => console.log(description)
        if (!helpFct) helpFct = () => console.log(`No specific help for '${name}' command`)
        this._dict[name] = {
            mainFct,
            description,
            helpFct,
            alias
        }
        alias.forEach(s => this._alias[s] = name)
    }

    // All availables commands names
    get names() {
        return [...Object.keys(this._dict), ...Object.keys(this._alias)]
    }

    // Descriptions List
    get descriptions() {
        return Object.keys(this._dict).map(name => {
            return {
                name,
                description: this._dict[name].description,
                alias: this._dict[name].alias,
            }
        })
    }

    // Run a command
    async run(name, argv) {
        let obj = this._dict[name]
        if (!obj) {
            if (this._alias[name]) name = this._alias[name]
            obj = this._dict[name]
        }
        if (!obj) throw(`unknown command : '${name}'`)
        const method = args.isHelp(argv) ? obj.helpFct : obj.mainFct
        if (!method) throw(`invalid command : '${name}'`)
        argv = args.removeHelpOption(argv)
        return method(this.packages, ...argv)
    }
}

module.exports = Commands
