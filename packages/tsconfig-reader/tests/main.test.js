const lib = require('../index.js')

const path = require('path')
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

describe('tsconfig-reader', function () {
    it('json', function () {
        const tsconfig = new lib(`${__dirname}/tsconfig.json`)
        const str = JSON.stringify(tsconfig.json, null, 4).replace(/\\\\/g, '\\')
        const result = replaceAbsPath(str)
        expect(result).toMatchSnapshot()
    })
    it('alias', function () {
        const tsconfig = new lib(`${__dirname}/tsconfig.json`)
        const result = replaceAbsPath(tsconfig.alias('@hello/something'))
        expect(result).toMatchSnapshot()
    })
})


