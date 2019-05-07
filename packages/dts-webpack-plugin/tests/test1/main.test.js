const childProcess = require('node-child-process-extension')

describe('dts-webpack-plugin', function () {
    it('test', async function () {
        await childProcess.extras.exe(`webpack`, __dirname)
        expect(0).toEqual(0)
    })
})
