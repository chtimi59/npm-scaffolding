#!/usr/bin/env node
'use strict'
const fs = require('fs')
const path = require('path')
const childProcess = require('child_process')

async function npmGetPrefix() {
    return new Promise((resolve, reject) => {
        let stdOut = ""
        const p = childProcess.spawn(`npm prefix -g`, [], { shell: true })
        p.on('error', e => reject(e))
        p.on('exit', code => {
            if (code) reject({errorCode: code})
            resolve(stdOut.trim())
        })
        p.stdout.on('data', data => stdOut += data)
    })
}

async function makeOrDeleteBin(src, dst, deleteReq = false) {
    console.log(`cmd link: ${dst}`)
    const isDstExist = fs.existsSync(dst)
    if (deleteReq && !isDstExist) return
    if (deleteReq) {
        fs.unlinkSync(dst)
    } else {
        let buff = fs.readFileSync(src).toString()
        buff = buff.replace(/\$basedir\/\.\.\/\.\.\/\.\.\/packages\//g, '$basedir/node_modules/')
        buff = buff.replace(/%~dp0\\\.\.\\\.\.\\\.\.\\packages\\/g, '%~dp0\\node_modules\\', '')
        fs.writeFileSync(dst, buff)
    }
}

async function createOrDeleteSymbLink(src, dst, deleteReq = false) {
    console.log(`module link: ${dst}`)

    const isDstExist = fs.existsSync(dst)
    if (deleteReq && !isDstExist) return

    let isDstValid = true
    if (isDstExist) {
        try {
            const src2 = fs.readlinkSync(dst)
            if (path.resolve(src).toUpperCase() !== path.resolve(src2).toUpperCase()) {
                throw(new Error('invalid link'))
            }
        } catch(e) {
            // dst exist but either it's
            //  - not a symblink
            //  - a symblink not pointing to the right place
            isDstValid = false
        }
    }

    if (!deleteReq && isDstExist) {
        if (!isDstValid) console.error(`'invalid ${dst}`)
        return
    }

    if (deleteReq) {
        fs.unlinkSync(dst)
    } else {
        try {
            fs.symlinkSync(src, dst, 'junction');
        } catch(e) {
            console.error(e.message)
        }
    }
}

async function main(option) {
    const deleteReq = (option === 'delete') 
    const globalPrefix = await npmGetPrefix(null, `npm prefix -g`)
    const baseDir = path.resolve("npm-global", "node_modules")
    const modules = await fs.readdirSync(baseDir)
    if (deleteReq) console.log(`removing:`)
    for(const m of modules) {
       if (m === '.bin') {
            const baseDirBins = path.resolve(baseDir, m)
            const bins = await fs.readdirSync(baseDirBins)
            for(const x of bins) {
                await makeOrDeleteBin(path.resolve(baseDirBins, x), path.resolve(globalPrefix, x), deleteReq)
            }
        } else {
            await createOrDeleteSymbLink(path.resolve(baseDir, m), path.resolve(globalPrefix, "node_modules", m), deleteReq)
        }
    }
}

main(...process.argv.slice(2))