'use strict'

const Operations = {
    'rm': {
        test: arg => /.*/.test(arg),
        run: async function(target) {
            console.log(`rm ${target}`)
        }
    },
    'cp': {
        test: arg => /(.+)/.test(arg),
        run: async function(cwd, target, from) {
            console.log(`cp ${from} ${target}`)
        }
    },
    'mv': {
        test: arg => /(.+)/.test(arg),
        run: async function(target, from) {
            console.log(`mv ${from} ${target}`)
        }
    },
    'symblink': {
        test:arg => /(.+)/.test(arg),
        run: async function(target, from) {
            console.log(`symblink ${from} ${target}`)
        }
    },
}

module.exports = Operations
