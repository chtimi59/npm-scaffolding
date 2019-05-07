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
            const t1 = await fs.extras.exists(from, 'folder')
            const t2 = await fs.extras.exists(target, 'folder')
            if (t2 && !t1) return // we may assume that this operation has been done
            return fs.promises.rename(from, target)
        }
    },
    'symlink': {
        test:arg => /(.+)/.test(arg),
        run: async function(obj) {
            const target = path.resolve(obj.nodemodulePath, obj.moduleName)
            const from = path.resolve(obj.currentDirPath, obj.arguments[0])
            return fs.extras.symlink(from, target)
        }
    },
}

module.exports = Operations
