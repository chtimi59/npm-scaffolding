module.exports = {
  "dependencies": {
    "moment": "^2.24.0"
  },
  "operationDependencies": {
    /* remove a node module */
    "color-name": "rm",
    /* rename a node module */
    "chalk-bis": "rename chalk",
    /* copy local 'foo' to mode_module 'foo' */
    "new-foo": "cp ./foo",
    /* create a symlink of local foo */
    "src-foo": "symlink ./foo",
    /* create a symlink of something in node_modules */
    "color-convert-2": "symlink ../node_modules/color-convert"
  }
}