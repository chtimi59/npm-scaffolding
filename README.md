# npm-scaffolding
[![CircleCI](https://circleci.com/gh/chtimi59/npm-scaffolding.svg?style=svg)](https://circleci.com/gh/chtimi59/npm-scaffolding)

Mono repo, see [packages/](packages)

[![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/)

# usefull commands
```
// mainly usefull if you don't have lerna globaly installed 
npm i

// monorepo boot up
npm run bootstrap

// install all /packages in global node modules
npm run link:global

// test all
npm t

// or... one test suite in watch mode
npm t -- tsconfig-reader --watch

// or... just jest directly (with npx)
npx jest packages/npm-twister/tests/test1

// test on linux if you've a window machine
docker run -ti -v %cd%:/mnt/app node:10 bash
```