const path = require('path')
const childProcess = require('node-child-process-extension')
const fs = require('node-fs-extension')
const nodePrefix = `node ${path.resolve(__dirname, '../../../npm-twister/npmt.js')}`
async function npmt(args="") {
    cmd = `${nodePrefix} ${args}`
    return childProcess.extras.exeToStdOut(cmd, __dirname)
}
const packageJson = path.resolve(__dirname, 'package.json')
const nodeModules = path.resolve(__dirname, 'node_modules')

describe('twister-scripts-modules-mngt', function () {
    describe('test1', function () {
        beforeAll(async function () {
            await fs.extras.rm(nodeModules)
            await fs.extras.writeJsonSync(packageJson, {
                "extends": "a/alt.js",
                "name": "mgnt-test1",
                "version": "1.0.0"
            })
        }, 15000)
        it('hello chalk', async function () {
            await npmt("hello chalk")
        }, 15000)
        it('install', async function () {
            await npmt("hello")
            // "color-name": "rm"
            expect(await fs.extras.exists(path.resolve(nodeModules, "color-name"), "folder"))
                .toEqual(false)
            // "chalk-bis": "rename chalk",
            expect(await fs.extras.exists(path.resolve(nodeModules, "chalk"), "folder"))
                .toEqual(false)
            expect(await fs.extras.exists(path.resolve(nodeModules, "chalk-bis"), "folder"))
                .toEqual(true)
            // "new-foo": "cp ./foo",
            expect(fs.readFileSync(path.resolve(nodeModules, "new-foo", "index.js")).toString())
                .toEqual("console.log('new foo')")
            // "src-foo": "symlink ./foo",
            expect(fs.readFileSync(path.resolve(nodeModules, "src-foo", "index.js")).toString())
                .toEqual("console.log('new foo')")
            // "color-convert-2": "symlink ../node_modules/color-convert"
            expect(await fs.extras.exists(path.resolve(nodeModules, "color-convert-2"), "folder"))
                .toEqual(true)
        }, 15000)
        it('re-install', async function () {
            const ret = await npmt("hello")
            expect(ret).toEqual("")
        }, 15000)
    })
})
