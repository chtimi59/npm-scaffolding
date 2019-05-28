const twister = require('../../../index')

const base = {
  "name": "c-name",
  "description": "c-description",
  "from-c": "Something from c:base"
}

const foo = "echo Hello C"

module.exports = twister.merge(base, {
    "scripts": {
      "c": foo
    }
})

