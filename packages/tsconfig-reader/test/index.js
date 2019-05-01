const tsconfigReader = require('./../index.js')
const tsconfig = new tsconfigReader(`${__dirname}/tsconfig.json`)
console.log(JSON.stringify(tsconfig.json, null, 4))
console.log(tsconfig.alias('@hello/something'))