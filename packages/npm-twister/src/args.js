'use strict'

/** Standard Helps */
const HelpsOptions = ['-h', '--h', '--help']

/** Test if argv[] contains helps options */
const isHelp = argv => HelpsOptions.reduce((v, test) => v || argv.includes(test), false)

/** Return argv[] without options */
const removeOptions = (argv, options) => argv.filter((v) => !options.includes(v))

/** Return argv[] without helps options */
const removeHelpOption = argv => removeOptions(argv, HelpsOptions)


/** Options Array to Key-Values Dictionary
 * 
 * arrayToDict(['foo','-t=5','-t=6','-r=7','-v'], ['-t','-v'])
 * Returns 
 * {
 *    options: { '-t':'6', '-v': true }, 
 *    remains: [ 'foo', '-r=7' ]
 * }
 */
function arrayToDict(argv, expected=[]) {
    const remains = []
    const options = {}
    for (const arg of argv) {
        if (!arg.startsWith('-')) {
            remains.push(arg)
            continue
        }

        const kv = arg.split('=')
        const key = kv[0]
        let value = kv[1]
        
        if (!expected.includes(key)) {
            remains.push(arg)
        } else {
            if (value === undefined) value = true
            options[key] = value
        }
    }
    return { options, remains }
}

module.exports = {
    arrayToDict,
    isHelp,
    removeOptions,
    removeHelpOption,
}
