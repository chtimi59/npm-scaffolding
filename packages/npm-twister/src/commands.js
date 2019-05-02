'use strict'
const fs = require('node-fs-extension')
const childProcess = require('node-child-process-extension')
const path = require('path')

const args = require('./args')

class Commands {

    constructor(packages) {
        this.packages = packages
        //
        // "this._dict" is a dictionnary of 
        //
        //      <name> : {                               -- command name
        //          alias: string[]                      -- command name alias
        //          description: string                  -- command description
        //          helpFct: async function(ctx,...argv) -- function to call if help is requested        
        //          mainFct: async function(ctx,...argv) -- function to call to run this command
        //      }
        //
        this._dict = {}
        this._alias = {}
    }

    // Add one command
    add(name, item) {
        // mandatory part
        if (!name || typeof name !== 'string') throw(new Error('name should be a <string> (non-empty)'))
        if (!item || typeof item !== 'object') throw(new Error('item should be an <object>'))
        if (!item.mainFct || typeof item.mainFct !== 'function') throw(new Error('mainFct should be a <function>'))
        // optional part
        if (item.description && typeof item.description !== 'string') throw(new Error('description should be a <string>'))
        if (item.alias && !Array.isArray(item.alias)) throw(new Error('alias should be a <string[]>'))
        if (item.helpFct && typeof item.helpFct !== 'function') throw(new Error('helpFct should be a <function>'))
        if (!item.helpFct && item.description) item.helpFct = () => console.log(item.description)
        // copy and default values
        item = {
            description: "",
            helpFct: () => console.log(`No specific help for '${name}' command`),
            alias: [],
            ...item
        }
        this._dict[name] = item
        item.alias.forEach(s => this._alias[s] = name)
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
        const stat = fs.statSync(filename) // throw if doesn't exist
        const isFile = stat.isFile()
        const name = isFile ? path.basename(filename, '.js') : path.basename(filename)
        const item = require(filename) // support filename and dirname and dirname with package.json
        try {
            // may throw if not be a valid command
            this.add(name, {
                alias: item.alias,
                description: item.description,
                helpFct: item.help,
                mainFct: item.main,
            })
        } catch(e) {
            console.log(e)
            return e.message
        }
    }

    // Add commands from Package.json scripts section
    addFromScripts(scripts) {
        if (!scripts) return
        for(const name in scripts) {
            const mainFct = async function(packages, ...argv) {
                let args = argv.join(" ")
                if (args) args = ' -- ' + args
                return childProcess.extras.exe(`npm run ${name}${args}`, packages.cwd)
            }
            this.add(name, {
                mainFct,
                description: "mapped to package.json scripts"
            })
        }
    }

    // All availables commands names
    get names() {
        return [...Object.keys(this._dict), ...Object.keys(this._alias)]
    }

    // Number of registred commanda
    get length() {
        return this.names.length
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
