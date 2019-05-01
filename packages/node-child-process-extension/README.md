# node-child-process-extension
Node Module to promisify nodeJS child_process module

## Examples
```js
const childProcess = require('node-child-process-extension')

// regular 'child-process' methods are preserved
childProcess.spawn("ls", "-l", {stdio: [0, 1, 2], shell: true})

// Extensions cames as 'extras'
await childProcess.extras.exe("ls -l")
console.log(await childProcess.extras.exeToStdOut("ls -l"))
```

## 'extras' API
```js
/**
 * Execute a Shell command
 * @param {*} command The command to run, with space-separated arguments.
 * @param {{} | string} [options] Regular spawn options or Current working directory
 */
async function exe(command, cwd) {}

/**
 * Execute a Shell command, promise is resolved with stdout
 * @param {*} command The command to run, with space-separated arguments.
 * @param {{} | string} [options] Regular spawn options or Current working directory
 */
async function exeToStdOut(command, cwd) {}
```
