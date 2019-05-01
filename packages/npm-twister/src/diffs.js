'use strict'

/** Find what has been changed */
function get(from, to) {
    return "hi!"
}

/** Apply patches */
function apply(obj, patches) {
    obj.test = 5
    return obj
}

module.exports = {
    get,
    apply
}
