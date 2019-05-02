const path = require('path')
const childProcess = require('node-child-process-extension')
const fs = require('node-fs-extension')
const nodePrefix = `node ${path.resolve(__dirname, '../../npmt.js')}`
async function npmt(args="") {
    cmd = `${nodePrefix} ${args}`
    return childProcess.extras.exeToStdOut(cmd, __dirname)
}
const packageJson = path.resolve(__dirname, 'package.json')
const nodeModules = path.resolve(__dirname, 'node_modules')

describe('npm-twister', function () {
    describe('test1', function () {
        beforeAll(async function () {
            await fs.extras.rm(packageJson)
            await fs.extras.rm(nodeModules)
        })

        it('local script description', async function () {
            const ret = await npmt("hello --help")
            expect(ret).toMatchSnapshot();
        })
        it('run local script', async function () {
            const ret = await npmt("hello")
            expect(ret.toUpperCase()).toEqual(__dirname.toUpperCase())
        })
        it('run npm init command', async function () {
            await npmt("init -y")
            const ret = await fs.extras.exists(packageJson, 'file')
            expect(ret).toEqual(true)
        })
        it('bump major version', async function () {
            await npmt("init -y")
            await npmt("version major")
            const ret = await npmt("getversion")
            expect(ret).toEqual("2.0.0")
        }, 10000)
    })
})
