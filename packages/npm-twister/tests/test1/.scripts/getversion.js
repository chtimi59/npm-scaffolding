'use strict'
const twister = require('../../../index')
module.exports = {main, alias: ['h']}

async function main(...argv) {
    console.log(twister.packages.root.json.version)
}
