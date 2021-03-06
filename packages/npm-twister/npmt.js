#!/usr/bin/env node
'use strict'
const path = require('path')
const childProcess = require('node-child-process-extension')
const title = path.basename(__filename, '.js')
const npmtPkg = require(path.resolve(__dirname, 'package.json'))
const packages = require('./src/packagesTree').singleton()
const npm = require('./src/npm')
const args = require('./src/args')

async function main(cmd, ...argv) {
    // main help ?
    if (!cmd || cmd=='help' || args.isHelp([cmd])) {
        showUsage()
        return
    }
    // run command
    await packages.start()
    let lastError = null
    try {
        if (packages.commands.names.includes(cmd)) {
            await packages.commands.run(cmd, argv)
        } else {
            await npm.run(cmd, argv)
        } 
    } catch(e) {
        lastError = e
    }
    await packages.stop() // ---------

    if (lastError) {
        if(lastError.message) console.error(lastError.message)
        console.error(lastError)
        process.exit(lastError.errorCode ? lastError.errorCode : 1)
    }
}

/* Usage */
async function showUsage()
{
    const PRINT_TWST_CMDS = true
    const PRINT_NPM_CMDS = true
    const PRINT_HELP_EXAMPLE = true

    console.log(`Usage:  ${title} <command>`)
    console.log()

    if (PRINT_NPM_CMDS) {
        process.stdout.write("wrapped commands from npm");

        const printNpmMethods = (title, arr) => {
            if (arr.length <= 0) return
            console.log(`    ${title}`)
            for(let i = 0; i<arr.length; i+=10) {
                console.log(`    ${arr.slice(i, i+10).join(', ')}`)
            }
            console.log()
        }

        const info = await npm.getInfo()
        const npmCommands = [...info.alias, ...info.commands].sort()
        const npmWrappedCommands = npmCommands.filter(c => !packages.commands.names.includes(c))
        const npmUnWrappedCommands = npmCommands.filter(c => packages.commands.names.includes(c))
        
        console.log(` (v${info.version}):`)
        console.log()
        printNpmMethods('available:', npmWrappedCommands)
        printNpmMethods('override:', npmUnWrappedCommands)
        console.log()
    }
    
    if (PRINT_TWST_CMDS && packages.commands.length) {
        console.log(`where:`)
        console.log()
        const strArr = packages.commands.descriptions.map(o => {
            const des = [o.description, o.alias.length ? `alias: ${o.alias.join(', ')}` : ''].filter(v => !!v) 
            let lines = [`    ${o.name.padEnd(12, ' ')}${des[0] ? des[0] : '-'}`]
            lines = lines.concat(des.slice(1).map(v => ' '.padStart(16) + v))
            return lines.join('\n')
        })
        console.log(strArr.join('\n\n'))
        console.log()
    }

    if (PRINT_HELP_EXAMPLE) {
        console.log(`Specific help example:`)
        console.log()
        console.log(`    ${title} install --help`)
        console.log()
    }

    console.log(`version: ${npmtPkg.version}`)
    console.log()
}

main(...process.argv.slice(2))