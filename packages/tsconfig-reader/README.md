# tsconfig.reader
Node Module to read tsconfig.json

## Brief
- Combine `extends` into a single
- Resolve paths to get absolute paths
- Provide alias method to resolve `compilerOptions.paths`

## Example
```js
const tsconfigReader = require('tsconfig-reader')
const tsconfig = new tsconfigReader()

console.log(JSON.stringify(tsconfig.json, null, 4))

// Alias resolution
console.log(tsconfig.alias('@foo/bar'))

```
