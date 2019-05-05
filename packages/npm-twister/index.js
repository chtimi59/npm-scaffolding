'use strict'
const packagesTree = require('./src/packagesTree')
const objectBool = require('./src/object-bool')
const args = require('./src/args')
const npm = require('./src/npm')

module.exports = {

    /** Actual packages tree discovered */ 
    packages : packagesTree.singleton(),

    // --
    
    /** helpers to deals with command line arguments */
    args,
    /** helpers to merge 2 objects */
    merge: objectBool.or,
    /** helpers to make a deep copy of 2 objects */
    copy: objectBool.unitary,
    /** helpers to deals with npm */
    npm
}
