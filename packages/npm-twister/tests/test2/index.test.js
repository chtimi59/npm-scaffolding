const path = require('path')
const childProcess = require('node-child-process-extension')
const fs = require('node-fs-extension')
const nodePrefix = `node ${path.resolve(__dirname, '../../npmt.js')}`
const isUnix = (path.sep === '/')
async function npmt(args="") {
    cmd = `${nodePrefix} ${args}`
    return childProcess.extras.exeToStdOut(cmd, __dirname)
}
const packageJson = path.resolve(__dirname, 'package.json')

const replaceAbsPath = str => {
    const base = __dirname.replace(/\\/g, '\\\\')
    const regEx = new RegExp(`(.*)${base}([^\\s\\"\\']*)([^\\${path.sep}]*)`)
    const arr = str.split('\n').map(i => {
        const u = i.match(regEx)
        if (!u) return i
        const he = u[1] || ""
        const pa = u[2] ? u[2].replace(/\\/g, '/') : ""
        const ta = u[3]  || ""
        return `${he}<ABSOLUTE>${pa}${ta}`
    })
    return arr.join('\n')
}


describe('npm-twister', function () {
    describe('test2', function () {
        beforeAll(async function () {
            fs.extras.writeJsonSync(packageJson, {
                "extends": "a",
                "name": "root-name",
                "description": "root-description",
                "scripts": {
                  "root": "echo Hello"
                },
                "license": "ISC",
                "version": "1.0.0"
            })
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
        it('local script description', async function () {
            const ret = await npmt("b-hello --help")
            expect(ret).toMatchSnapshot()
        })
        it('run local script A', async function () {
            let ret = replaceAbsPath(await npmt("a 1 2 3"))
            if (isUnix) ret = ret.replace(/1\ 2\ 3/g, "\"1\" \"2\" \"3\"")
            expect(ret).toMatchSnapshot()
        })
        it('run local script B', async function () {
            let ret = replaceAbsPath(await npmt("b 1 2 3"))
            if (isUnix) ret = ret.replace(/1\ 2\ 3/g, "\"1\" \"2\" \"3\"")
            expect(ret).toMatchSnapshot()
        })
        it('run local script C', async function () {
            let ret = replaceAbsPath(await npmt("c 1 2 3"))
            if (isUnix) ret = ret.replace(/1\ 2\ 3/g, "\"1\" \"2\" \"3\"")
            expect(ret).toMatchSnapshot()
        })
        it('run local script a-hello', async function () {
            const ret = await npmt("ha 1 2 3")
            expect(ret).toMatchSnapshot()
        })
        it('bump major version', async function () {
            const ret = await npmt("majversion")
            expect(ret).toMatchSnapshot()
        }, 10000)
        it('run local script b-hello', async function () {
            await npmt("hb")
            const ret = await npmt("a-hello")
            expect(ret).toMatchSnapshot()
        })
    })
})
