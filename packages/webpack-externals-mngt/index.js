'use strict'
const path = require('path')
const fs = require('fs')
const tsconfigReader = require('tsconfig-reader')

// original inspiration "npm i webpack-node-externals"

/*

context: {
    rootDir: string // root directory (i.e. where package.jon sit)
    options: object // Manager options used
    ruleIndex: number // Current rule index in options.rules[]
    target: string // Current target applied (set by previous rules)
    webpackContext: string // Current webpack original context
}

request: {
    filename: string: // Absolute module filename (or webpackRequest if isBuiltin is set to true)
    isBuiltIn: boolean // True, if module filename can not be resolved (such as 'fs', 'path' and such)
    webpackRequest: string // Current webpack original request
}

*/

const is = {
    builtIn: () => (context, request) => request.isBuiltIn,
    nodeModule: moduleName => (context, request) => request.isBuiltIn ? false : request.filename.startsWith(path.resolve(path.join(context.rootDir, "node_modules", moduleName))),
    isWebpack: () => (context, request) => context.webpackContext.startsWith(path.join(context.rootDir, "node_modules", "webpack"))
}

const lib = {
    root: (name) => (context, request) => context.target = name ? name : path.basename(request.filename),
    commonjs: (name) => (context, request) => context.target = `commonjs ${name ? name : request.webpackRequest}`,
    commonjs2: (name) => (context, request) => context.target = `commonjs2 ${name ? name : request.webpackRequest}`,
    amd: (name) => (context, request) => context.target = `amd ${name ? name : request.webpackRequest}`,
    bundle: () => (context, request) => context.target = null
}


class Manager {

    resolve(f) { return path.resolve(path.join(this.rootDir, f)) }

    constructor(options) {
        this.options = {
            /* externals rules */
            rules: [],
            /** Path of 'package.json' */
            packageJsonPath: "./package.json",
            /** path of 'tsconfig.json' */
            tsconfigPath: null,
            /** log file (without extension) */
            summaryFile: null,

            ...options
        }
        // Get rootDir
        this.options.packageJsonPath = path.resolve(this.options.packageJsonPath)
        if (!fs.existsSync(this.options.packageJsonPath)) throw(new Error(`package.json not found ('${this.options.packageJsonPath}')`))
        this.rootDir = path.dirname(this.options.packageJsonPath)
        this.nodeModulesDir = this.resolve("node_modules")
        
        // optional tsconfig.json
        if (this.options.tsconfigPath) this.tsconfig = new tsconfigReader(this.options.tsconfigPath)

        // Format options
        if (!Array.isArray(this.options.rules)) this.options.rules = [this.options.rules]
        this.options.rules = this.options.rules.map(i => {
            const test = typeof(i.test) === 'string' ? this.resolve(i.test) : i.test
            return {...i, test}
        })
        if (this.options.summaryFile) this.options.summaryFile = `${this.options.summaryFile}.md`
        
        // Log stuff
        if (this.options.summaryFile)
        {
            // Make a copy of options for log
            let optionsLog = {...this.options}
            optionsLog.rules = optionsLog.rules.map(i => {
                let test = "<undefined>"
                test = typeof(i.test) === 'string' ? i.test : test
                test = typeof(i.test) === 'function' ? `QTRIM(${i.test.name || "function"}())` : test
                test = typeof(i.test) === 'object' ? `QTRIM(${i.test.toString()})` : test
                let target = null
                target = typeof(i.target) === 'string' ? i.target : target
                target = typeof(i.target) === 'function' ? `QTRIM(${i.target.name || "function"}())` : target
                return {test, target}
            })
            optionsLog = JSON.stringify(optionsLog, null, 4)
            optionsLog = optionsLog.replace(/\"QTRIM\((.*)\)\"/g, "$1")
            optionsLog = optionsLog.replace(/\\\\/g,"\\")

            let header = "# Webpack External Managment\n"
            header += "## Options used:\n"
            header += "```js\n"
            header += `${optionsLog}\n`
            header += "```\n"
            header += "## Embedded modules:\n"
            header += `| included | external library | context | filename |\n`
            header += `|----------|------------------|---------|----------|\n`
            // make sure that folder exists on webpack output
            fs.mkdirSync(path.dirname(this.options.summaryFile), { recursive: true })
            fs.writeFileSync(this.options.summaryFile, header)
        }
        return this.onModuleEvent.bind(this)
    }

    // Call by webpack on each modules
    onModuleEvent(webpackContext, webpackRequest, callback) {

        const filename = this.getAbsolutePath(webpackContext, webpackRequest)
        const context = {
            // root directory (i.e. where package.jon sit)
            rootDir: this.rootDir,
             // Manager options used
            options: this.options,
            // Current rule index in options.rules[]
            ruleIndex: 0,
            // Current target applied (set by previous rules)
            target: null,
            // Current webpack original context
            webpackContext
        }
        const request = {
            // Absolute module filename (or webpackRequest if isBuiltin is set to true)
            filename: filename || webpackRequest,
            // True, if module filename can not be resolved (such as 'fs', 'path' and such)
            isBuiltIn: (filename === null),
            // Current webpack original request
            webpackRequest
        }

        // For each modules, all rules are tested/applied (from first to last) 
        for(let ruleIndex = 0; ruleIndex < this.options.rules.length; ruleIndex++) {
            context.ruleIndex = ruleIndex
            if (this.test(context, request)) this.target(context, request)
        }

        // conclusion
        const isExternal = !!context.target

        // log
        if (this.options.summaryFile) {
            const target = context.target ? context.target : "-"
            const filename = request.isBuiltIn ? `*${request.filename}*` : request.filename.replace(this.rootDir, ".")
            //https://emojipedia.org/
            const msg = `| ${isExternal ? '⛔': '✔️'} | ${target} | ${webpackContext} | ${filename} |\n`
            fs.appendFileSync(this.options.summaryFile, msg)
        }

        // Apply
        if (isExternal) {
            callback(null, context.target)
        } else {
            callback()
        }
    }

    // Return absolute path or null if the path can't be reolved
    getAbsolutePath(cwd, req) {
        let output = null
        // if req starts by ".", "/" or "Letter:\", then we may assume that's a filename
        const isFilename = /^([\.\/])|^([a-zA-Z]\:\\)/.test(req)
        if (isFilename) {
            output = /^\./.test(req) ? path.join(cwd, req) : req
        } else {
            // request, is a module name
            const rootDirs = [cwd, this.nodeModulesDir]
            const rootDir = rootDirs.find(f => {
                const test = path.join(f, req)
                if (fs.existsSync(test)) return true
                if (fs.existsSync(`${test}.js`)) return true
                return false
            })
            // module Path
            if (!rootDir) {
                // typescript may define some alias
                if (this.tsconfig) output = this.tsconfig.alias(req)
            } else {
                output = path.join(rootDir, req)
            }
        }
        // Make sure that the absolute path is fully resolved
        if (!output) return null
        return path.resolve(output)
    }
    
    test(context, request) {
        const rule = this.options.rules[context.ruleIndex]
        const pattern = rule.test
        if (typeof(pattern) === 'string') return pattern === request.filename
        if (typeof(pattern) === 'object') return pattern.test(request.filename)
        if (typeof(pattern) === 'function') return pattern(context, request)
        throw(new Error('Invalid test'))
    }

    target(context, request) {
        const rule = this.options.rules[context.ruleIndex]
        const target = rule.target
        if (!target) {
            context.target = null
            return
        }
        if (typeof(target) === 'string') {
            context.target = `${target}`
            return
        }
        if (typeof(target) === 'function') {
            target(context, request)
            return
        }
        throw(new Error('Invalid test'))
    }
}

module.exports = {
    Manager,
    is,
    lib
}
