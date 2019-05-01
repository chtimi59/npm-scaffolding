# Webpack Externals Manager
Extends the original webpack 4 externals

## Prerequist
You need to know, how [Webpack treats externals](https://webpack.js.org/configuration/externals/) treats natively *externals*

## Brief
This modules extends original webpack *externals*, with a list of rules for fine tune management

Example of webpack config:

```js
externals: [
    new ExternalsMngt.Manager({
        rules: [
            /* Examples */
            { 
                // builtin (such as 'fs') becomes
                // <root> library (such as "fs" => "fs")
                test: ExternalsMngt.is.builtIn,
                target: ExternalsMngt.lib.root()
            },
            { 
                // this specific builtin (path) becomes
                // <root> library ("path" => "myPath")
                test: "path",
                target: "myPath" // or ExternalsMngt.lib.root("myPath")
            },
            { 
                // Node module witch starts with "dev." becomes
                // commonjs library
                test: /node_modules\/dev.*/),
                target: ExternalsMngt.lib.commonjs()
            },
            {
                // this specific node modules (moment) becomes
                // commonjs library ( => "commonjs myMoment")
                test: ExternalsMngt.is.nodeModule("moment"),
                target: ExternalsMngt.lib.commonjs("myMoment")
            }
        ],
        /* optionals */
        packageJsonPath: './package.json', // default value './package.json'
        summaryFile: 'bundle.log', // default value null
     }
]
```

## How does it work ?
Each rule is composed of:
- a **test**, which returns true if the module should be external
- a **target**, to define how the *external* should be made

For each modules, all rules are tested/applied (from first to last) 

Hence you may define general cases at the really beginning, and then, in the lastest rules, you may defines some specifics situations

## Rule's test
The test is applied on requested module **filename**, which should be the absolute path of the actual module

>
> ⚠️note⚠️:
>
> If module filename can not be resolved, then, filename is set to the original webpack-request
>
> and we may assume that's a global module (such as 'fs', 'path' and such)
>
> **isBuiltIn** flag will be set to true
>

The test can be
- a string: It will returns true if there is an exact match
- a regex
- a function(context, request), where

```ts
     context: {
         rootDir: string // root directory (i.e. where package.json sit)
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
```
Examples
```js
// return true, if webpack request is a builtIn/global module
const isBuiltIn(context, request) => request.isBuiltIn

// return true, if webpack request is a specific node_modules package (moduleName)
function isNodeModule(moduleName) {
    return function(context, request) {
        const base = path.resolve(path.join(context.rootDir, "node_modules", moduleName))
        if (request.isBuiltIn) return false
        return request.filename.startWith(base)
    }
}
```

## rule's target
Target defined how to use the external module, typically webpack 4 supports the following library:
- **commonjs**: The library should be available as a CommonJS module.
- **commonjs2**: Similar to the above but where the export is module.exports.default.
- **amd**: Similar to commonjs but using AMD module system.
- **\<root\>**: The library should be available as a global variable

target can be:
- a string
- a function(context, request)

Examples
```js
// return a <root> library where the root is actually the filename basename
function basename(context, request) {
    context.target = path.basename(request.filename)
}

// set a specific string
function rename(value) {
    return function(context, request) {
        context.target = value
    }
}
// or merely...
const rename = (value) => (context, request) => context.target = value
```