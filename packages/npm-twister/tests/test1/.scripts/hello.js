'use strict'
const twister = require('../../../index')
module.exports = {main, description: "Some description about hello.js", alias: ['h']}

async function main(...argv) {
    console.log(twister.packages.root.filename)
}
