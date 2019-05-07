const baz = require('./lib/baz')
const url = require('url')
const fs = require('fs')

export function bar() {
    const t = baz.fct('ok')
    console.log(t, url, fs)
}