module.exports = {
  "dependencies": {
    "moment": "^2.24.0"
  },
  "operationDependencies": {
    /* remove node module 'bar' */
    "bar": "rm",
    /* rename node module 'foo' to 'old-foo' */
    "old-foo": "rename foo",
    /* copy local foo to mode_module 'foo' */
    "new-foo": "cp ./foo",
    /* create a symlink of local foo */
    "src-foo": "symlink ./foo",
    /* create a symlink of something in node_modules */
    "moment-2": "symlink ../node_modules/moment"
  }
}