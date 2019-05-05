'use strict'
const childProcess = require('node-child-process-extension')
const twister = require('npm-twister')
const Dependencies = require('./dependencies')

// DEFINITION
// ---------------------------------
module.exports = {main, help, description: "install prerequist", alias: ['i', 'isntall', 'add']}

async function help() {
    console.log(`Description:`)
    console.log()
    console.log(`    This command proxy regular 'npm install <args>'`)
    console.log()
    console.log(`Usage:`)
    let npmHelp = await childProcess.extras.exeToStdOut('npm install --help', { failedOnErrorCode: false })
    npmHelp = npmHelp.split('\n').map(s => `    ${s}`).join('\n')
    console.log(npmHelp)
    console.log()
    console.log(`Twisted case:`)
    console.log(`    npm install (with no args, in package dir)`)
    console.log(`        1- Returns if './node_modules/' is already uptodate (see --force option)`)
    console.log(`        2- Call regular 'npm install'`)
    console.log(`        3- Apply potential 'operationDependencies' section`)
    console.log()
    console.log(`New options:`)
    console.log()
    console.log(`    --force : Don't check if './node_modules/' is already uptodate`)
}

// EXECUTION
// ---------------------------------
async function main(...argv) {
    const dependencies = new Dependencies(twister.packages)
    const {options, remains} = twister.args.arrayToDict(argv, ['--force'])
    if (remains.length > 0) {
        await twister.npm.run('install', ...remains)
    } else {
        // 1- Returns if 'node_modules' are already uptodate (see --force option)
        if (!options['--force']) {
            const remains = dependencies.todo()
            const todo = { add: remains.add.length, rm: remains.rm.length }
            if (todo.add + todo.rm ===0) return
            const add = todo.add ? `install ${todo.add} missing packages` : ''
            const rm = todo.rm ? `remove ${todo.rm} extras packages` : ''
            console.log((add && rm) ? `> ${add} and ${rm}` : `> ${add}${rm}`)
        }
        // 2- Call regular 'npm install'
        await twister.npm.run('install')
        // 3- Apply potential 'operationDependencies' section
        await dependencies.doOperations()
    }
}
