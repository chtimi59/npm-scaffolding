'use strict'
const packagesTree = require('./src/packagesTree')
const merge = require('./src/object-bool').or
const args = require('./src/args')
const npm = require('./src/npm')

module.exports = {
    args,
    merge,
    npm,
    packages : packagesTree.singleton()
}
