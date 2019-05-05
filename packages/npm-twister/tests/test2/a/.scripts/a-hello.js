'use strict'
const twister = require('../../../../index')
module.exports = {main, description: "Some description about a-hello.js", alias: ['ha']}

console.log("-- LOAD A ONLY ONCE --")

async function main(...argv) {
    console.log(twister.packages.json)
    console.log(argv)
}
