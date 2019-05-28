'use strict'
const fs = require('node-fs-extension')
const twister = require('../../../../index')
module.exports = {main, description: "update major version"}

async function main() {
    await twister.npm.run("version", "major")
    const json = fs.extras.readJsonSync("package.json")
    console.log(json.version)
}
