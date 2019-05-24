const lib = require('../index.js')
const path = require('path')

describe('node-fs-extension', function () {

    beforeEach(async function () {
        await lib.extras.rm(".tmp")
    });

    afterEach(async function () {
        await lib.extras.rm(".tmp")
    }),

    it('existsSync', async function () {
        expect(lib.extras.existsSync(".tmp/b/c/d", "file")).toEqual(false)
        expect(lib.extras.existsSync(".tmp/b/c/d", "folder")).toEqual(false)
        expect(lib.extras.existsSync(".tmp/b/c/d")).toEqual(false)
        await lib.extras.mkdir(".tmp/b/c/d")
        lib.extras.writeJsonSync(".tmp/b/c/d/e", {a: 1})
        expect(lib.extras.existsSync(".tmp/b/c/d", "file")).toEqual(false)
        expect(lib.extras.existsSync(".tmp/b/c/d", "folder")).toEqual(true)
        expect(lib.extras.existsSync(".tmp/b/c/d")).toEqual(true)
        expect(lib.extras.existsSync(".tmp/b/c/d/e", "file")).toEqual(true)
        expect(lib.extras.existsSync(".tmp/b/c/d/e", "folder")).toEqual(false)
        expect(lib.extras.existsSync(".tmp/b/c/d/e")).toEqual(true)
        expect(await lib.extras.exists(".tmp/b/c/d", "file")).toEqual(false)
        expect(await lib.extras.exists(".tmp/b/c/d", "folder")).toEqual(true)
        expect(await lib.extras.exists(".tmp/b/c/d")).toEqual(true)
        expect(await lib.extras.exists(".tmp/b/c/d/e", "file")).toEqual(true)
        expect(await lib.extras.exists(".tmp/b/c/d/e", "folder")).toEqual(false)
        expect(await lib.extras.exists(".tmp/b/c/d/e")).toEqual(true)
    }),

    it('copy', async function () {
        await lib.extras.mkdir(".tmp/b/c/d")
        lib.extras.writeJsonSync(".tmp/b/c/d/e", {a: 1})
        await lib.extras.copy(".tmp/b", ".tmp/a")
        const t = lib.extras.readJsonSync(".tmp/b/c/d/e")
        expect(t).toEqual({a: 1})
    })

    it('find', async function() {

        // 1- returns [./node_modules/micromatch/README.md]
        const a = await lib.extras.find("./node_modules/jest/README.md")
        expect(a.length).toEqual(1)
        // 2- return []
        const b = await lib.extras.find("./node_modules/jest/notexist")
        expect(b.length).toEqual(0)
        // 3- return list of files and folders (recursive)
        const c = await lib.extras.find("./node_modules/jest/")
        expect(c.length > 5).toEqual(true)
        // 4- return list of files (recursive)
        const d = await lib.extras.find("./node_modules/jest/", {folders: false})
        expect(d.length > 5 && d.length < c.length).toEqual(true)

        // 5- all those 3, are identical and returns all '.js' files
        const e = await lib.extras.find("./node_modules/jest/", "*.js")
        const f = await lib.extras.find("./node_modules/jest/", "./node_modules/jest/**/*.js")
        const g = await lib.extras.find("./node_modules/jest/", `${path.resolve("./node_modules/jest/")}\\**\\*.js`)
        expect(e.length > 5).toEqual(true)
        expect(e).toEqual(f)
        expect(e).toEqual(g)

        // 6- all those 2, are identical and returns all '.js' files in a specific folder
        const h = await lib.extras.find("./node_modules/jest/", "*.json", {depth: 0})
        const i = await lib.extras.find("./node_modules/jest/", "./node_modules/jest/*.json")
        expect(h.length > 1).toEqual(true)
        expect(h).toEqual(i)

        // 7- returns all files that have "i" in their path (like 'index.js' or 'lib/parsers.js')
        // note: base part ('./node_modules/micromatch/') is not used by the regular expression test
        const k = await lib.extras.find("./node_modules/jest/", /i/, {folders: false})
        expect(k.length > 5).toEqual(true)
    })
})
