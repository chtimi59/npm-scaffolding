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
            await fs.extras.writeJsonSync(packageJson, {
                "extends": "a/alt.js",
                "name": "mgnt-test1",
                "version": "1.0.0"
            })
            await fs.extras.rm(nodeModules)
            await fs.extras.mkdir(path.resolve(nodeModules, "foo"))
            await fs.promises.writeFile(path.resolve(nodeModules, "foo", "index.js"), "")
            await fs.extras.mkdir(path.resolve(nodeModules, "bar"))
            await fs.promises.writeFile(path.resolve(nodeModules, "bar", "index.js"), "")
        })
        it('empty', async function () {
            try {
                const ret = await npmt("")
                expect(ret).toMatchSnapshot();
            } catch(e) {
                console.error(e)
                throw(e)
            }
        })
        it('install', async function () {
            await npmt("hello")
            const t1 = await fs.extras.exists(path.resolve(nodeModules, "bar"), "folder")
            expect(t1).toEqual(false)
            const t2 = fs.readFileSync(path.resolve(nodeModules, "new-foo", "index.js")).toString()
            expect(t2).toEqual("console.log('new foo')")
            const t3 = fs.readFileSync(path.resolve(nodeModules, "old-foo", "index.js")).toString()
            expect(t3).toEqual("")
            const t4 = fs.readFileSync(path.resolve(nodeModules, "src-foo", "index.js")).toString()
            expect(t4).toEqual("console.log('new foo')")
            const t5 = fs.readFileSync(path.resolve(nodeModules, "moment", "README.md")).toString()
            const t6 = fs.readFileSync(path.resolve(nodeModules, "moment-2", "README.md")).toString()
            expect(t5).toEqual(t6)
        })
    })
})
