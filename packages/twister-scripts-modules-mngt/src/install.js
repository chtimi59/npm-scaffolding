'use strict'
const childProcess = require('node-child-process-extension')
const twister = require('npm-twister')
const Dependencies = require('./dependencies')

// DEFINITION
// ---------------------------------
module.exports = {main, help, description: "install prerequist", alias: ['i', 'isntall', 'add']}

async function help(...argv) {
    console.log(`Description:`)
    console.log()
    console.log(`    This command will call regular 'npm install <args>'`)
    console.log()
    console.log(`Usage:`)
    let npmHelp = await childProcess.extras.exeToStdOut('npm install --help', { failedOnErrorCode: false })
    npmHelp = npmHelp.split('\n').map(s => `    ${s}`).join('\n')
    console.log(npmHelp)
    console.log()
    console.log(`Behavior:`)
    console.log()
    console.log(`1- Returns if 'node_modules' are already uptodate (see --force option)`)
    console.log(`2- Patch 'package.json' (mainly to to flat "extends" tree)`)
    console.log(`3- Call 'npm install'`)
    console.log(`4- Apply potential 'operationDependencies' section (see --no-op)`)
    console.log(`5- Restore package.json`)
    console.log(`6- Merge back potentials 'package.json' changes`)
    console.log()
    console.log(`New options:`)
    console.log()
    console.log(`    --force : Don't check if 'node_modules' are already uptodate`)
    console.log(`    --no-op : Skip 'operationDependencies' section`)
}

// EXECUTION
// ---------------------------------
async function main(...argv) {
    const dependencies = new Dependencies(twister.packages)
    /*const {options, remains} = libs.args.arrayToDict(argv, ['--force', '--no-op'])
    console.log(remains)
    if (!options['--force']) {
        const remains = packages.dependencies.todo()
        const todo = { add: remains.add.length, rm: remains.rm.length }
        if (todo.add + todo.rm ===0) return
        const add = todo.add ? `install ${todo.add} missing packages` : ''
        const rm = todo.rm ? `remove ${todo.rm} extras packages` : ''
        console.log((add && rm) ? `> ${add} and ${rm}` : `> ${add}${rm}`)
    }

    if (!options['--no-op']) {
        await packages.dependencies.doOperations()
    }*/
}
