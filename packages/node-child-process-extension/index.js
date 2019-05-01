'use strict'
const childProcess = require('child_process')

/**
 * Execute a Shell command
 * @param {*} command The command to run, with space-separated arguments.
 * @param {{} | string} [options] Regular spawn options or Current working directory
 */
async function exe(command, options) {
    //options
    if (typeof options === 'string') options = { cwd: options }
    options = {
        cwd: null,
        failedOnErrorCode: true,
        stdio: [0, 1, 2],
        shell: true,
        ...options
    }    
    /* space-separated arguments */
    if (command) command = command.trim()
    if (!command) throw(new Error('Command missing'))
    const args = command.split(' ').filter(s => !!s)
    command = args.shift() // command is the fist arg
    if (!command) throw(new Error('Command missing'))
    /* promisify */
    return new Promise((resolve, reject) => {
        const p = childProcess.spawn(command, args, options)
        p.on('error', e => reject(e))
        p.on('exit', code => {
            if (options.failedOnErrorCode && code) reject({errorCode: code})
            resolve({errorCode: code})
        })
    })
}

/**
 * Execute a Shell command, promise is resolved with stdout
 * @param {string} command The command to run, with space-separated arguments.
 * @param {{} | string} [options] Regular spawn options or Current working directory
 */
async function exeToStdOut(command, options) {
    //options
    if (typeof options === 'string') options = { cwd: options }
    options = {
        cwd: null,
        failedOnErrorCode: true,
        shell: true,
        ...options
    }
    /* space-separated arguments */
    if (command) command = command.trim()
    if (!command) throw(new Error('Command missing'))
    const args = command.split(' ').filter(s => !!s)
    command = args.shift() // command is the fist arg
    if (!command) throw(new Error('Command missing'))
    /* promsify */
    return new Promise((resolve, reject) => {
        let stdOut = ""
        const p = childProcess.spawn(command, args, options)
        p.on('error', e => reject(e))
        p.on('exit', code => {
            if (options.failedOnErrorCode && code) reject({errorCode: code})
            resolve(stdOut.trim())
        })
        p.stdout.on('data', data => stdOut += data)
    })
}

childProcess.extras = {
    exe,
    exeToStdOut
}

module.exports = childProcess
