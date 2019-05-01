'use strict'

/**
 * Tests whether a given filename exists or not
 * @param {{}} dest Object
 * @param {{}} src Object
 */
function merge(dest, src) {
    if (src === null || src === undefined) return
    if (typeof dest !== 'object' || dest === null) throw (new TypeError(`'Invalid dest object (${typeof dest})`))
    if (typeof src !== 'object' || src === null) throw (new TypeError(`Invalid src object (${typeof src})`))
    for(const k in src) {
        const value = src[k]
        const type = typeof value
        do {
            if (value === undefined || value === null ||
                type === 'string' || type === 'number') {
                dest[k] = value
                break
            }
            if (Array.isArray(value)) {
                if (dest[k] === undefined || dest[k] === null) dest[k] = []
                merge(dest[k], value)
                break
            }
            if (typeof src[k] === 'object') {
                if (dest[k] === undefined || dest[k] === null) dest[k] = {}
                merge(dest[k], value)
                break
            }
        } while(0)
    }
    return dest
}

module.exports = merge
