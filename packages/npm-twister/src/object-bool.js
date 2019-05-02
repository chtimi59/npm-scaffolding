'use strict'

/**
 * Limited types
 * @param {{}} a Object
 */
const typeofEx = a => {
    if (Array.isArray(a)) return 'array'
    if ((a === null || a === undefined)) return 'undefined'
    const type = typeof a
    if (type === 'object') return type
    if (type === 'string' || type === 'number') return 'primitives'
    return 'unsupported'
}

/**
 * Helpers which throw an exception if one arg is not an object
 * @param  {...any} args 
 */
const assetIsIterable = function(...args) {
    for(const a of args) {
        const type = typeofEx(a)
        if (type !== 'object' && type !== 'array') {
            throw (new TypeError(`'Invalid object (${typeof a})`))
        }
    }
}

/**
 * A : Returns copy of an object
 * @param {{}} a Object
 */
function unitary(a) {
    if (typeofEx(a) === 'undefined') return undefined
    assetIsIterable(a)
    return JSON.parse(JSON.stringify(a))
}

/**
 * A OR B : Returns merge of 2 objects
 * @param {{}} a Object
 * @param {{}} b Object
 */
function or(a, b) {
    if (typeofEx(a) === 'undefined' && typeofEx(b) === 'undefined') return {}
    if (typeofEx(a) !== 'undefined' && typeofEx(b) === 'undefined') return unitary(a)
    if (typeofEx(a) === 'undefined' && typeofEx(b) !== 'undefined') return unitary(b)
    assetIsIterable(a, b)
    const c = unitary(b)
    for(const k in a) {
        const lhs = typeofEx(a[k])
        const rhs = typeofEx(b[k])
        do {
            if (lhs === 'primitives' || lhs === 'undefined') {
                c[k] = a[k]
                break
            }
            if (lhs === 'object') {
                c[k] = (lhs !== rhs) ? unitary(a[k]) : or(a[k], c[k])
                break
            }
            if (lhs === 'array') {
                // should be improved ?
                c[k] = (lhs !== rhs) ? unitary(a[k]) : or(a[k], c[k])
                break
            }
        } while(0)
    }
    return c
}

/**
 * A AND B : Returns intersection of 2 objects
 * @param {{}} a Object
 * @param {{}} b Object
 */
function and(a, b) {
    if (typeofEx(a) === 'undefined' && typeofEx(b) === 'undefined') return {}
    if (typeofEx(a) !== 'undefined' && typeofEx(b) === 'undefined') return {}
    if (typeofEx(a) === 'undefined' && typeofEx(b) !== 'undefined') return {}
    assetIsIterable(a, b)
    const c = typeofEx(a) === 'array' ? [] : {}
    for(const k in a) {
        const lhs = typeofEx(a[k])
        const rhs = typeofEx(b[k])
        if (lhs !== rhs) continue
        do {
            if (lhs === 'primitives' || lhs === 'undefined') {
                if (b[k] === a[k]) c[k] = a[k]
                break
            }
            if (lhs === 'object') {
                c[k] = and(a[k], b[k])
                break
            }
            if (lhs === 'array') {
                // should be improved ?
                c[k] = and(a[k], b[k])
                break
            }
        } while(0)
    }
    return c
}

/**
 * A AND (NOT B): Returns half exclusion of 2 objects
 * @param {{}} a Object
 * @param {{}} b Object
 */
function hxor(a, b) {
    if (typeofEx(a) === 'undefined' && typeofEx(b) === 'undefined') return {}
    if (typeofEx(a) !== 'undefined' && typeofEx(b) === 'undefined') return unitary(a)
    if (typeofEx(a) === 'undefined' && typeofEx(b) !== 'undefined') return {}
    assetIsIterable(a, b)
    const c = typeofEx(a) === 'array' ? [] : {}
    for(const k in a) {
        const lhs = typeofEx(a[k])
        const rhs = typeofEx(b[k])
        do {
            if (lhs === 'primitives' || lhs === 'undefined') {
                if (lhs !== rhs || b[k] !== a[k]) c[k] = a[k]
                break
            }
            if (lhs === 'object') {
                c[k] = (lhs !== rhs) ? unitary(a[k]) : hxor(a[k], b[k])
                break
            }
            if (lhs === 'array') {
                // should be improved ?
                c[k] = (lhs !== rhs) ? unitary(a[k]) : hxor(a[k], b[k])
                break
            }
        } while(0)
    }
    return c
}

/**
 * A XOR B: Returns exclusion of 2 objects
 * @param {{}} a Object
 * @param {{}} b Object
 */
function xor(a, b) {
    return or(hxor(a, b), hxor(b, a))
}

/**
 * B - A 
 * @param {{}} a Object
 * @param {{}} b Object
 */
function remove(a, b) {
    if (typeofEx(a) === 'undefined' && typeofEx(b) === 'undefined') return {}
    if (typeofEx(a) !== 'undefined' && typeofEx(b) === 'undefined') return {}
    if (typeofEx(a) === 'undefined' && typeofEx(b) !== 'undefined') return unitary(b)
    assetIsIterable(a, b)
    let c = unitary(b)
    for(const k in a) {
        const lhs = typeofEx(a[k])
        const rhs = typeofEx(b[k])
        do {
            if (lhs === 'primitives' || lhs === 'undefined') {
                if (lhs === rhs && b[k] === a[k]) delete c[k]
                break
            }
            if (lhs === 'object') {
                if (lhs === rhs) c[k] = remove(a[k], c[k])
                break
            }
            if (lhs === 'array') {
                // should be improved ?
                if (lhs === rhs) c[k] = remove(a[k], c[k])
                break
            }
        } while(0)
    }
    return c
}

module.exports = {
    and,
    or,
    xor,
    hxor,
    unitary,
    remove
}

/*
{ list: { a: '^0.0.1', c: '^0.0.1' } }
{ list: { a: '^0.0.1', b: '1.2.3', c: '^0.0.1', e: '1.2.3' } }
*/