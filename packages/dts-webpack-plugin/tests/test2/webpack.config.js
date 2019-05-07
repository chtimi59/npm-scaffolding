const DTSPlugin = require('../../index')
const path = require('path')

module.exports = {
    mode: 'development',
    entry: './src/index.ts',
    module: {
       rules: [
            {
              test: /\.ts$/,
              loaders: 'ts-loader',
              exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".ts", ".js"],
        alias: {
            /* just here to show that alias are indeed supported by ('dts-webpack-plugin') */
            "@stuff": path.resolve("src/stuff/")
        }
    },
    plugins: [
        new DTSPlugin({

            /* Typescript config file (default tsconfig.json) */
            configFile: "./tsconfig.json",

            /* Webpack generated entry point (default index.d.ts) */
            entry: "index.d.ts",
            /* Should be the same as package.json "types" (default index.d.ts) */
            output: "types.d.ts",

            /* Declaration file to add at the top of output declaration file (default: []) */
            headers: [{
                    // file path
                    path: "./src/amb.d.ts",
                    // optional string replacement
                    replacement: [{ match: /\/\*export\*\//, value: 'export'}]
            }],

            /* Extras declarations files to copy in webpack output folder (default: [])
            * recurisivly copy *.d.ts files */
            extraIncludes: [{

                    //
                    // copy:
                    //   source = `${base}/${relativePath}/**/*.ts
                    //   destination = `${webpackOutput}/${relativePath}/**/*.ts
                    //
                    base: "src/",
                    relativePath: "stuff"
            }]

        })
    ]
}
