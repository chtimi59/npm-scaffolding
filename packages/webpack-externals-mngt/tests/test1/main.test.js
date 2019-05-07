const childProcess = require('node-child-process-extension')

describe('webpack-externals-mngt', function () {
    it('test1', async function () {
        await childProcess.extras.exe(`webpack`, __dirname)
        expect(0).toEqual(0)
    })
})
