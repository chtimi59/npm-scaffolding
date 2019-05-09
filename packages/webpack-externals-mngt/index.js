'use strict'
const path = require('path')
const fs = require('node-fs-extension')
const tsconfigReader = require('tsconfig-reader')

// original inspiration "npm i webpack-node-externals"

/*

context: {
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
    builtIn: (name = "") => (context, request) => {
        if (!request.isBuiltIn) return false
        return name ? request.filename === name : true
    },
    nodeModule: (name = "") => (context, request) => {
        if (request.isBuiltIn) return false
        const base = path.resolve(context.options.rootDir, "node_modules", name)
        return request.filename.startsWith(base)
    },
    isWebpack: () => (context, request) => {
        if (request.isBuiltIn) return false
        const base = path.resolve(context.options.rootDir, "node_modules", "webpack")
        context.webpackContext.startsWith(base)
    }
}

const lib = {
    root: (name) => (context, request) => context.target = `${name ? name : path.basename(request.filename)}`,
    commonjs: (name) => (context, request) => context.target = `commonjs ${name ? name : request.webpackRequest}`,
    commonjs2: (name) => (context, request) => context.target = `commonjs2 ${name ? name : request.webpackRequest}`,
    amd: (name) => (context, request) => context.target = `amd ${name ? name : request.webpackRequest}`,
    bundle: () => (context, request) => context.target = null
}


class Manager {

    resolve(f) { return path.resolve(this.options.rootDir, f) }
    relative(f) { return f.replace(this.options.rootDir, '.') }

    constructor(options) {
        this.options = {
            /* externals rules */
            rules: [],
            /** Root Directory (where is './node_modules/') */
            rootDir: ".",
            /** Path to 'tsconfig.json' (used to known alias) */
            tsconfigPath: null,
            /** log file (without extension) */
            summaryFile: null,

            ...options
        }
        // Get rootDir
        this.options.rootDir = path.resolve(this.options.rootDir)
        
        // optional tsconfig.json
        if (this.options.tsconfigPath) this.options.tsconfigPath = this.resolve(this.options.tsconfigPath)
        if (this.options.tsconfigPath) this.tsconfig = new tsconfigReader(this.options.tsconfigPath)

        // Format options
        if (!Array.isArray(this.options.rules)) this.options.rules = [this.options.rules]
        this.options.rules = this.options.rules.map(i => {
            const test = typeof(i.test) === 'string' ? this.resolve(i.test) : i.test
            return {...i, test}
        })
        
        // Log stuff
        if (this.options.summaryFile)
        {
            this.options.summaryFile = this.resolve(`${this.options.summaryFile}.md`)

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
            if (optionsLog.summaryFile) optionsLog.summaryFile = this.relative(optionsLog.summaryFile)
            if (optionsLog.tsconfigPath) optionsLog.tsconfigPath = this.relative(optionsLog.tsconfigPath)
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

        const filename = this.requireResolve(webpackContext, webpackRequest)
        const context = {
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
            const filename = request.isBuiltIn ? `*${request.filename}*` : this.relative(request.filename)
            //https://emojipedia.org/
            const msg = `| ${isExternal ? '⛔': '✔️'} | ${target} | ${this.relative(webpackContext)} | ${filename} |\n`
            fs.appendFileSync(this.options.summaryFile, msg)
        }

        // Apply
        if (isExternal) {
            callback(null, context.target)
        } else {
            callback()
        }
    }

    // Return absolute path or null if the path can't be resolved
    requireResolve(ctx, req) {
        // try to mimic require.resolve(req, {paths: modulePaths})
        // excepts:
        //  1- don't use GLOBAL_FOLDERS
        //  2- don't returns the actual .js file (if req refer to a folder)
        //  3- return null if not found (instead of throwing an exception)

        // Search paths (like module.paths without GLOBAL_FOLDERS
        let modulePaths = ctx.split(path.sep).reduce((acc, folderSection, idx) => {
            if (idx > 0) {
                acc.push(path.join(acc[idx-1], folderSection))
            } else {
                acc.push(`${folderSection}${path.sep}`)
            }
            return acc
        }, [])
        modulePaths = modulePaths.map(f => path.resolve(f, "node_modules"))
        // local path (without 'node_modules')
        modulePaths.push(ctx)
        // reverse to make sure that first item is the 'clothest' path (like module.paths)
        modulePaths.reverse()
        // find first existed module
        for(const base of modulePaths) {
            const test = path.join(base, req)
            const jsFile = test.toUpperCase().endsWith('.JS') ? test : `${test}.js`
            if (fs.extras.existsSync(jsFile, 'file')) return test
            if (fs.extras.existsSync(test, 'folder')) {
                if (fs.extras.existsSync(path.join(test, 'index.js'), 'file')) return test
                if (fs.extras.existsSync(path.join(test, 'package.json'), 'file')) return test
            }
        }
        return null
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
