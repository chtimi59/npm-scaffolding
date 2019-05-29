const childProcess = require('node-child-process-extension')
const fs = require('node-fs-extension')
const path = require('path')
const outDir = path.resolve(__dirname, "dist")

describe('dts-webpack-plugin', function () {
    it('test2', async function () {
        await childProcess.extras.exe(`webpack`, __dirname)
        const t1 = await fs.extras.exists(path.resolve(outDir, "types.d.ts"), "file")
        const t2 = await fs.extras.exists(path.resolve(outDir, "lib", "a.d.ts"), "file")
        const t3 = await fs.extras.exists(path.resolve(outDir, "stuff", "baz.d.ts"), "file")
        expect(t1 && t2 && t3).toEqual(true)
        const ret = fs.readFileSync(path.resolve(outDir, "types.d.ts")).toString()
        expect(ret).toMatchSnapshot()
    }, 15000)
})
