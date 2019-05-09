const a = require('./a')
const b = require('./b')
const c = require('./c/foo')
const url = require('url')
//const fs = require('fs')

export function bar() {
    console.log(a)
    console.log(b)
    console.log(c)
    console.log(url)
}