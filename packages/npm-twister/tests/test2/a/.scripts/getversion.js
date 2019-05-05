'use strict'
const twister = require('../../../../index')
module.exports = {main, description: "get current version", alias: ['v']}

async function main(...argv) {
    console.log(twister.packages.root.json.version)
}
