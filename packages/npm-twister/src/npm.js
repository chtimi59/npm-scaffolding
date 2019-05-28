'use strict'
const childProcess = require('node-child-process-extension')

/** Parse 'npm -l' result */
async function getInfo() {
    let npmHelp
    try {
        npmHelp = await childProcess.extras.exeToStdOut('npm -l', { failedOnErrorCode: false })
    } catch(e) {
        return 
    }
    
    let commands = []
    let alias = []
    let version

    // parse npm help to get command list
    {
        const reg = /^ {4,}([^\n ]+) {2,}[^\n]+$/mg
        let match = reg.exec(npmHelp);
        while (match != null) {
            commands.push(match[1])
            match = reg.exec(npmHelp);
        }
    }
    // parse npm help to get aliases command
    {
        const reg = /alias(es)?: ([^\n]+)$/mg
        let match = reg.exec(npmHelp);
        while (match != null) {
            const tmp = match[2].split(",").map(v => v.trim())
            alias = alias.concat(tmp)
            match = reg.exec(npmHelp);
        }
    }
    // parse npm help to get npm version
    {
        let match = npmHelp.match(/npm@(\d.\d.\d)/m)
        if (match) version=match[1]
    }
    return { commands, alias, version }
}

async function run(cmd, ...argv) {
    await childProcess.extras.exe(`npm ${cmd} ${argv.join(' ')}`)
}

module.exports = {
    getInfo,
    run
}