const a = require('./a')
const b = require('./b')
const c = require('./c/foo')
const d = require('d')
const url = require('url')
const fs = require('fs')

export function bar() {
    console.log(a)
    console.log(b)
    console.log(c)
    console.log(d)
    console.log(url)
    console.log(fs)
}