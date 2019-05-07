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
            "@stuff": path.resolve("src/stuff/")
        }
    },
    plugins: [
        new DTSPlugin({
            entry: "index.d.ts",
            output: "types.d.ts",
            configFile: "tsconfig.json",
            headers: [{
                    path: "./src/amb.d.ts",
                    replacement: [{ match: /\/\*export\*\//, value: 'export'}]
            }],
            extraIncludes: [{
                    base: "src/",
                    relativePath: "stuff"
            }]
        })
    ]
}
