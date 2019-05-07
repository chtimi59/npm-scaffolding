'use strict'
const fs = require('node-fs-extension')
const path = require('path')

const Operations = {
    'rm': {
        test: arg => true,
        run: async function(obj) {
            const target = path.resolve(obj.nodemodulePath, obj.moduleName)
            return fs.extras.rm(target)
        }
    },
    'cp': {
        test: arg => /(.+)/.test(arg),
        run: async function(obj) {
            const target = path.resolve(obj.nodemodulePath, obj.moduleName)
            const from = path.resolve(obj.currentDirPath, obj.arguments[0])
            await fs.extras.copy(from, target)
        }
    },
    'rename': {
        test: arg => /(.+)/.test(arg),
        run: async function(obj) {
            const target = path.resolve(obj.nodemodulePath, obj.moduleName)
            const from = path.resolve(obj.nodemodulePath, obj.arguments[0])
            return fs.extras.rename(from, target)
        }
    },
    'symblink': {
        test:arg => /(.+)/.test(arg),
        run: async function(obj) {
            const target = path.resolve(obj.nodemodulePath, obj.moduleName)
            const from = path.resolve(obj.currentDirPath, obj.arguments[0])
            return fs.extras.symlink(from, target)
        }
    },
}

module.exports = Operations
