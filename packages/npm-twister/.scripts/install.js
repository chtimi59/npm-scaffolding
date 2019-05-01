'use strict'
const libs = require('./../index')

// DEFINITION
// ---------------------------------
module.exports = {main, help, description: "install prerequist", alias: ['i', 'isntall', 'add']}

async function help(packages, ...argv) {
    console.log(`
Description:

    This command will call regular 'npm install <args>'`)

    console.log(`
Usage:
`)
    let npmHelp = await libs.childProcess.extras.exeToStdOut('npm install --help', { failedOnErrorCode: false })
    npmHelp = npmHelp.split('\n').map(s => `    ${s}`).join('\n')
    console.log(npmHelp)
    
    console.log(`
Behavior:

    1- Returns if 'node_modules' are already uptodate (see --force option)
    2- Patch 'package.json' (mainly to to flat "extends" tree)
    3- Call 'npm install' 
    4- Apply potential 'operationDependencies' section (see --no-op)
    5- Restore package.json
    6- Merge back potentials 'package.json' changes`)

    console.log(`
New options:

    --force : Don't check if 'node_modules' are already uptodate
    --no-op : Skip 'operationDependencies' section`)
}

// EXECUTION
// ---------------------------------
async function main(packages, ...argv) {
    const {options, remains} = libs.args.arrayToDict(argv, ['--force', '--no-op'])
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
    }
}
