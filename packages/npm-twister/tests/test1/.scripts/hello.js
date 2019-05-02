'use strict'
module.exports = {main, description: "Some description about hello.js", alias: ['h']}

async function main(packages, ...argv) {
    console.log(packages.cwd)
}
