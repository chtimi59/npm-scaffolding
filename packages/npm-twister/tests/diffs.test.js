const lib = require('../src/diffs')

describe('npm-twister', function () {
    describe('diffs', function () {
        it('test', function () {
            let from = { b: { c: 2 } }
            let to = { b: { c: 3 } }
            const changes = lib.get(from, to)
            console.log(changes)
            expect(0).toEqual(0)
        })
    })
})

//this.original = diffs.apply(this.original, changes)
