'use strict'
const Packages = require('./src/packages')
const merge = require('./src/object-bool').or
const args = require('./src/args')
const npm = require('./src/npm')

module.exports = {
    args,
    merge,
    npm,
    Packages
}
