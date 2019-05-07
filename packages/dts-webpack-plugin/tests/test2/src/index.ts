import * as a from './lib/a'
import * as baz from '@stuff/baz'

export function bar(v: string) {
    const t = baz.fct(v)
    return `!${a.foo(t)}!${SOMETHING}!`
}