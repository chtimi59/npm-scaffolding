import * as a from './lib/a'

export function bar(v: string) {
    return `!${a.foo(v)}!`
}