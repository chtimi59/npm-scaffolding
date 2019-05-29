# tsconfig-reader
Node Module to properly read tsconfig.json

## Install
```bash
npm i tsconfig-reader -D
```

## Brief
- Combine `extends`
- Resolve paths to get absolute paths
- Provide alias method to resolve `compilerOptions.paths`

# Examples
```js
const tsconfigReader = require('tsconfig-reader')
const tsconfig = new tsconfigReader()

console.log(JSON.stringify(tsconfig.json, null, 4))

// Alias resolution
console.log(tsconfig.alias('@foo/bar'))

```
