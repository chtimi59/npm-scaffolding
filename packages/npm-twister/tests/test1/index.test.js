const path = require('path')
const childProcess = require('node-child-process-extension')
const fs = require('node-fs-extension')
const nodePrefix = `node ${path.resolve(__dirname, '../../npmt.js')}`
async function npmt(args="") {
    cmd = `${nodePrefix} ${args}`
    return childProcess.extras.exeToStdOut(cmd, __dirname)
}
const packageJson = path.resolve(__dirname, 'package.json')

describe('npm-twister', function () {
    describe('test1', function () {
        beforeAll(async function () {
            await fs.extras.rm(packageJson)
        })
        it('empty', async function () {
            try {
                const ret = await npmt("")
                expect(ret).toMatchSnapshot()
            } catch(e) {
                console.error(e)
                throw(e)
            }
        })
        it('local script description', async function () {
            const ret = await npmt("hello --help")
            expect(ret).toMatchSnapshot()
        })
        it('run local script', async function () {
            const ret = await npmt("hello")
            expect(ret.toUpperCase()).toEqual(packageJson.toUpperCase())
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
        }, 15000)
    })
})
