'use strict'
module.exports = {main, alias: ['h']}

async function main(packages, ...argv) {
    console.log(packages.json.version)
}
