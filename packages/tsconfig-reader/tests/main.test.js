const lib = require('../index.js')

const base = __dirname.replace(/\\/g, '\\\\')
const removeAbs = s => s.replace(new RegExp(base, 'g'), "<ABSOLUTE>")

describe('tsconfig-reader', function () {
    it('json', function () {
        const tsconfig = new lib(`${__dirname}/tsconfig.json`)
        const result = removeAbs(JSON.stringify(tsconfig.json, null, 4).replace(/\\\\/g, '\\'))
        expect(result).toMatchSnapshot()
    })
    it('alias', function () {
        const tsconfig = new lib(`${__dirname}/tsconfig.json`)
        const result = removeAbs(tsconfig.alias('@hello/something'))
        expect(result).toMatchSnapshot()
    })
})


