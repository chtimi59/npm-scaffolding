'use strict'
const fs = require('fs')
const path = require('path')
const pathEx = require('./pathEx')
const DeclarationFile = require('./DeclarationFile')
const tsconfigReader = require('tsconfig-reader')

const PluginName = 'DTSPlugin'
const DeclarationReg = /\.d\.ts$/

/*
// helper to learn about Webpack structure
const objectTypes = (obj) => obj ? Object.keys(obj).reduce((a,k) => { 
  if (/^_/.test(k)) return a // we don't care about private
  const value = obj[k]
  if (value === null | value === undefined) return a //nothing here apparently
  const type = typeof(value)
  if (['boolean', 'number', 'string'].includes(type)) {
    a[k] = value
  } else {
    a[k] = `[${type}]`
  }
  return a
}, {}) : "?"
*/

module.exports = class {

  constructor(options) {
    this.options = {
      /* Entry point */
      entry: "index.d.ts",
      /* Default output */
      output: "index.d.ts",
      /* Typescript config file */
      configFile: "tsconfig.json",
      /* Declaration file to add at the top of output declaration file*/
      headers: [],
      /* Extras declarations files to copy */
      extraIncludes: [],
      ...options
    }
    // Typescript configfile
    this.tsconfig = new tsconfigReader(this.options.configFile)
    this.tsdeclarationDir = this.tsconfig.json.compilerOptions.declarationDir
  }

  apply(compiler) {
      
      //https://webpack.js.org/api/compiler-hooks

      // on emit
      compiler.hooks.emit.tapAsync(PluginName, (compilation, callback) => {
        try {
          
          DeclarationFile.tsconfig = this.tsconfig
          
          // ex: F:\dev\myproject\dist\
          const webpackOutput = path.resolve(compiler.outputPath)
          if (!this.options.entry.startsWith(path.sep)) this.options.entry = path.join(path.sep, this.options.entry)

          // assets to emit
          const dtsAssets = {}
          // assets to remove
          const assetToRemove = []

          // Main Output (from options.output)
          // ex: F:\dev\myproject\dist\mytypes\types.d.ts
          const mainAbsolute = path.resolve(webpackOutput, this.options.output)
          // ex: mytypes\types.d.ts
          const mainRelative = pathEx.relativePath(webpackOutput, mainAbsolute, false)
          if (!mainRelative) throw new Error(`${PluginName}: invalid Bundle path '${mainAbsolute}' (should be a child of '${webpackOutput}')`)
          // add this new asset
          dtsAssets[mainRelative] = new DeclarationFile()
          // add Headers in it
          for (const header of this.options.headers) {
            const absolute = path.resolve(header.path)
            if (!fs.existsSync(absolute)) throw new Error(`${PluginName}: file do not exists '${absolute}`)
            // load declaration file
            const dts = new DeclarationFile({file: header.path})
            // perform some optional replacements
            if (header.replacement) header.replacement.forEach(r => dts.replace(r.match, r.value))
            // concatenate in the existing asset
            dtsAssets[mainRelative].concat(dts)
          }

          // Copy Extras declaration files
          for (const include of this.options.extraIncludes) {
              const base = path.resolve(include.base)
              const absolute = path.join(base, include.relativePath)
              if (!fs.existsSync(absolute)) throw new Error(`${PluginName}: file do not exists '${absolute}`)
              // Should be a declarations files
              const files = pathEx.walkSync(absolute).filter(f => DeclarationReg.test(f))
              files.forEach(file => {
                // load declaration file
                const dts = new DeclarationFile({file})
                // add this new asset
                const relative = file.substring(base.length)
                dtsAssets[relative] = dts
              })
          }

          // Copy Typescript generated declaration files
          if (compilation.options.entry) {
            // Get .ts entries
            let tsentries = (typeof compilation.options.entry === 'string') ? [compilation.options.entry] : Object.values(compilation.options.entry)
            // make nested entries flat
            tsentries = tsentries.reduce((a, i) => {
              Array.isArray(i) ? a = a.concat(i) : a.push(i)
              return a
            } , [])
            // remove querystring, to keep real path
            tsentries = tsentries.map(s => s.replace(/(\?.*)$/, ""))
            // only keep ts files
            tsentries = tsentries.filter(s => /.ts$/.test(s))
            // resolution
            tsentries = tsentries.map(v => path.resolve(v))
            // search common root directory
            const commonEntryBase = tsentries.reduce((a,i) => pathEx.commonAncestor(a, path.dirname(i)), null)
            // For each wepback entries, a set of declaration files would be generated
            for (const entry of compilation.entries) {
                // filter out non ts entries
                if (!tsentries.includes(entry.resource)) continue
                // F:\dev\myproject\src
                const absoluteDir = path.dirname(path.resolve(entry.resource))
                // \src
                const relativeDir = absoluteDir.substring(commonEntryBase.length)
                // F:\dev\myproject\tsout\src
                const tsdeclarationDir = path.join(this.tsdeclarationDir, relativeDir)
                // Webpack assets
                const assets = compilation.assets
                // for each assets
                for (const key in assets) {
                  // Should be a declaration file
                  if (!DeclarationReg.test(key)) continue
                  // F:\dev\myproject\tsout\src\cache\index.d.ts
                  const absolute = path.resolve(webpackOutput, key)
                  // Should be in the right context
                  if (!absolute.startsWith(tsdeclarationDir)) continue
                  // load declaration file
                  const dts = new DeclarationFile({key, assets})
                  // resolve Alias
                  dts.resolveModule(path.dirname(absolute.replace(tsdeclarationDir, absoluteDir)))
                  // cache\index.d.ts
                  const relative = absolute.replace(tsdeclarationDir, "")
                  // add it in webpack output 
                  if (relative === this.options.entry) {
                    // concatenate in the existing asset
                    dtsAssets[mainRelative].concat(dts)
                  } else {
                    // add this new asset
                    dtsAssets[relative] = dts
                  }
                  // remove the old one
                  assetToRemove.push(key)
                }
            }
          }

          // Assets Emission
          assetToRemove.forEach(k => delete compilation.assets[k])
          for(const key in dtsAssets) {
            // make sure that folder exists on webpack output
            fs.mkdirSync(path.dirname(path.join(webpackOutput, key)), { recursive: true })
            // Add it
            compilation.assets[key] = dtsAssets[key].toAsset()
          }

        } catch(e) {
          console.error('')
          console.error(e)
          compilation.warnings.push(`${PluginName}: errors occurs`)
        }
        callback()
      })
  }
}
