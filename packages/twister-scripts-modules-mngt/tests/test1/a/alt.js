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
    "foo": "cp ./foo",
    /* create a symblink of local foo */
    "foo-src": "symblink ./foo",
    /* create a symblink of something in node_modules */
    "moment-2": "symblink ../node_modules/moment"
  }
}