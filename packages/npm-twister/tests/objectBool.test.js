const path = require('path')
const lib = require('../src/object-bool')

describe('npm-twister', function () {
    describe('object-bool', function () {

        // or
        it('or-1', function () {
            const from = null
            const to = { b: { c: 3 } }
            expect(lib.or(from, to)).toEqual(to)
        }),
        it('or-2', function () {
            const from = { b: { c: 3 } }
            const to = undefined
            expect(lib.or(from, to)).toEqual(from)
        })
        it('or-3', function () {
            const from = { b: { c: 4 } }
            const to = { b: { c: 3, d: 5 } }
            expect(lib.or(from, to)).toEqual({ b: { c: 4, d: 5 } })
        })
        it('or-4', function () {
            const from = { b: [ 1, 2, 3 ] }
            const to = { b: [ 0, 0, 0, 4 ] }
            expect(lib.or(from, to)).toEqual({ b: [ 1, 2, 3, 4] })
        })
        it('or-5', function () {
            const from = { b: [ {a: 1}, {b: 2} ] }
            const to = { b: [ 0, {c: 3}, {e: 4} ] }
            expect(lib.or(from, to)).toEqual({ b: [ {a: 1}, {b: 2, c: 3}, {e: 4}] })
        })

        // and
        it('and-1', function () {
            const from = null
            const to = { b: { c: 3 } }
            expect(lib.and(from, to)).toEqual({})
        })
        it('and-2', function () {
            const from = { b: { c: 3 } }
            const to = undefined
            expect(lib.and(from, to)).toEqual({})
        })
        it('and-3', function () {
            const from = { b: { c: 3, e: 4} }
            const to = { b: { c: 3 } }
            expect(lib.and(from, to)).toEqual({ b: { c: 3 } })
        })
        it('and-4', function () {
            const from = { b: [ 1, 2, 3 ] }
            const to = { b: [ 0, 2, 0, 4 ] }
            expect(lib.and(from, to)).toEqual({ b: [undefined, 2]})
        })
        it('and-5', function () {
            const from = { b: [ 1, 2, 3 ] }
            const to = { b: [ 1, 2, 0, 4 ] }
            expect(lib.and(from, to)).toEqual({ b: [1, 2]})
        })
        it('and-6', function () {
            const from = { b: [ {a: 1}, {b: 2} ] }
            const to = { b: [ 0, {b: 2, c: 3}, {e: 4} ] }
            expect(lib.and(from, to)).toEqual({ b: [undefined, {b: 2}] })
        })

        // hxor
        it('hxor-1', function () {
            const from = null
            const to = { b: { c: 3 } }
            expect(lib.hxor(from, to)).toEqual({})
        })
        it('hxor-2', function () {
            const from = { b: { c: 3 } }
            const to = undefined
            expect(lib.hxor(from, to)).toEqual(from)
        })
        it('hxor-3', function () {
            const from = { b: 1, c: 4, f: 1 }
            const to = { b: 1, c: 3, e: 4 }
            expect(lib.hxor(from, to)).toEqual({ c: 4, f: 1 })
        })
        it('hxor-4', function () {
            const from = { b: { c: 4, f: 1 } }
            const to = { b: { c: 3, d: 5 } }
            expect(lib.hxor(from, to)).toEqual({ b: { c: 4, f: 1 } })
        })
        it('hxor-5', function () {
            const from = { b: [ 1, 2, 3 ] }
            const to = { b: [ 0, 2, 0, 4 ] }
            expect(lib.hxor(from, to)).toEqual({ b: [1, undefined, 3]})
        })
        it('hxor-6', function () {
            const from = { b: [ 1, 2, 3 ] }
            const to = { b: [ 1, 2, 0, 4 ] }
            expect(lib.hxor(from, to)).toEqual({ b: [undefined, undefined, 3]})
        })
        it('hxor-7', function () {
            const from = { b: [ {a: 1}, {b: 2} ] }
            const to = { b: [ 0, {b: 2, c: 3}, {e: 4} ] }
            expect(lib.hxor(from, to)).toEqual({ b: [{a: 1}, {}]})
        })

        //xor
        it('xor-1', function () {
            const from = [0,1,2,3,4]
            const to   = [0,1,9,3,4]
            expect(lib.xor(from, to)).toEqual([null, null, 2])
        })
        it('xor-2', function () {
            const from = { a:1, b:2, c:3, d:4 }
            const to   = { a:1, b:2, d:4 }
            expect(lib.xor(from, to)).toEqual({c:3})
        })
        it('xor-3', function () {
            const from = { a:1, b:2, c:3, d:4 }
            const to   = { a:1, b:2, c:4, d:4 }
            expect(lib.xor(from, to)).toEqual({c:3})
        })

        //test
        it('test', function () {
            const from = { list: { a:'^0.0.1', b:'^0.0.1', c: '^0.0.1' }}
            const to = { list: { a:'5.0.1', b:'^0.0.1', d: '^0.0.1' }}

            const added = lib.hxor(to, from) // a: updated, d:added
            const removed = lib.hxor(from, to) // a: updated, c: removed

            const main = { list: { a:'^0.0.4', b:'1.2.3', c: '^0.0.1', e: '1.2.3' }}
            const main2 = lib.remove(removed, main)
            const main3 = lib.or(added, main2)
            expect(main3).toEqual({ list: { a: '5.0.1', b: '1.2.3', e: '1.2.3', d: '^0.0.1' } })
        })
    })
})
