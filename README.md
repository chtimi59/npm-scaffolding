# npm-scaffolding
Mono repo

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

see [packages/](packages)

# usefull commands
```
// monorepo boot up
npm run bootstrap

// install packages in global node modules
npm run link:global

// test all
npm t

// or... one test suite in watch mode
npm t -- tsconfig-reader --watch
```