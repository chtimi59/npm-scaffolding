const lib = require('../src/args')

describe('npm-twister', function () {
    describe('args', function () {
        it('test', function () {
            const result = lib.arrayToDict(['foo','-t=5','-t=6','-r=7','-v'], ['-t','-v'])
            expect(result).toEqual({
                options: { '-t': '6', '-v': true },
                remains: [ 'foo', '-r=7' ]
            })
        })
    })
})
