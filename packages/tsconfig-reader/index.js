
'use strict'
const path = require('path')
const fs = require('fs')

/** Read tsonfig.json */
function readSync(configFile) {
  
  let fileName = path.resolve(configFile)
  let baseDir = path.dirname(fileName)
  if (!fs.existsSync(configFile)) throw(new Error(`file not found ${configFile}`))

  // Open file (may throw)
  const str = fs.readFileSync(fileName).toString()  
  
  // Parse JSON nicely
  let tsconfig = {}
  try {
    tsconfig = JSON.parse(str)
  } catch(e) {
    const msg = e.message
    console.error(`error in ${fileName}`)
    console.error(msg)
    let jsonPos = msg.match(/position ([\d]+)/)
    if (jsonPos) jsonPos = Number(jsonPos[1])
    if (jsonPos>0) {
      let idx = 0
      const lines = str.replace(/\r/,'\\r').split(/\n/)
      do {
        const len = lines[idx].length + 1 
        if (jsonPos <= len) break;
        jsonPos -= len
        idx++
      } while (true)

      if (idx>0) console.log(lines[idx-1])
      console.log(lines[idx])
      console.log("".padStart(jsonPos) + "^")
    }
    throw new Error((`error in ${fileName}`));
  }

  // default -- https://www.typescriptlang.org/docs/handbook/compiler-options.html
  if (!tsconfig.compilerOptions) tsconfig.compilerOptions = {}  
  if (!tsconfig.compilerOptions.outDir) tsconfig.compilerOptions.outDir = "dist"
  if (!tsconfig.compilerOptions.declaration) tsconfig.compilerOptions.declaration = false
  if (!tsconfig.compilerOptions.declarationDir) tsconfig.compilerOptions.declarationDir =  tsconfig.compilerOptions.outDir
  
  // Resolve path
  tsconfig.compilerOptions.outDir = path.resolve(baseDir, tsconfig.compilerOptions.outDir)
  tsconfig.compilerOptions.declarationDir = path.resolve(baseDir, tsconfig.compilerOptions.declarationDir)
  if (tsconfig.extends) tsconfig.extends = path.resolve(baseDir, tsconfig.extends)
  if (tsconfig.include) tsconfig.include = tsconfig.include.map(i => path.resolve(baseDir, i))
  if (tsconfig.compilerOptions.baseUrl) {
    tsconfig.compilerOptions.baseUrl = path.resolve(baseDir, tsconfig.compilerOptions.baseUrl)
  } else {
    tsconfig.compilerOptions.paths = undefined // paths alias require baseUrl
  }

  if (tsconfig.compilerOptions.paths) {
    const aliases = tsconfig.compilerOptions.paths
    for (const key of Object.keys(aliases)) {
      aliases[key] = aliases[key].map(i => path.resolve(tsconfig.compilerOptions.baseUrl, i))
    }
  }
  
  // Extends an other Json file ?
  if (tsconfig.extends) {
    const obj = readSync(tsconfig.extends)
    tsconfig = {...obj, tsconfig}
  }
  
  return tsconfig
}

module.exports = class {
    constructor(configFile) {
      if (!configFile) configFile = "./tsconfig.json"
      if (!/tsconfig\.json$/.test(configFile)) configFile = path.join(configFile, "tsconfig.json")
      this.json = readSync(configFile)
    }

    alias(modulePath) {
      if (!modulePath) return null
      
      // relative can't be aliased
      const isRelative = /^[\/\.]/.test(modulePath)
      if (isRelative) return null

      // alias are not used in tsconfig
      if (!this.json.compilerOptions.paths) return null
      const aliases = this.json.compilerOptions.paths

      for (let k of Object.keys(aliases)) {
        // alias not defined
        // TODO: check with paths is an array in tsconfig ?
        if (!aliases[k][0]) return configFile
        const v = aliases[k][0]

        // alias check
        const isWildChar = (/\*$/.test(k))
        const key = isWildChar ? k.replace(/(\*$)/, '') : k
        const value = isWildChar ? v.replace(/(\*$)/, '') : v
        if (!isWildChar && modulePath === key) return value
        if (isWildChar && modulePath.startsWith(key)) return modulePath.replace(key, value)
      }

      // alias not found
      return null
    }
}
