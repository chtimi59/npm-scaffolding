const DTSPlugin = require('../../index')

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
        extensions: [".ts"]
    },
    plugins: [
        new DTSPlugin()
    ]
}
