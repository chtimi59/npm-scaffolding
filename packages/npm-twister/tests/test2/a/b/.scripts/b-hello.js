'use strict'
const fs = require('node-fs-extension')
const twister = require('../../../../../index')
module.exports = {main, description: "Some description about b-hello.js", alias: ['hb']}

async function main() {
    const json = twister.copy(twister.packages.json)
    json.list[1]["tres"] = 3
    delete json.list[2]
    fs.extras.writeJsonSync("package.json", json)
}
