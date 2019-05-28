const lib = require('../index.js')
const path = require('path')

describe('node-child-process-extension', function () {
    describe('exeToStdOut', function () {
        it('default', async function () {
            return lib.extras.exeToStdOut('pwd')
        })
        it('errorcode', async function () {
            const ret = lib.extras.exeToStdOut('something_that_hopefully_dont_exists', {failedOnErrorCode: false})
            expect(ret.errorCode !== 0).toEqual(true)
        })
        it('cwd should match __dirname', async function () {
            let ret = await lib.extras.exeToStdOut('pwd', __dirname)
            if (path.sep === '\\') {
                ret = ret.replace(/^(\/)([a-zA-Z])/, '$2:')
                ret = ret.replace(/\//g, '\\')
            }
            expect(ret.toUpperCase()).toEqual(__dirname.toUpperCase())
        })
    }),
    describe('exe', function () {
        it('default', async function () {
            return lib.extras.exe('pwd')
        })
        it('errorcode', async function () {
            const ret = lib.extras.exe('something_that_hopefully_dont_exists', {failedOnErrorCode: false})
            expect(ret.errorCode !== 0).toEqual(true)
        })
        it('cwd should match __dirname', async function () {
            return await lib.extras.exe('pwd', __dirname)
        })
    })
})
