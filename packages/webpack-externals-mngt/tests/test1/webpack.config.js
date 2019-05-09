const ExternalsMngt = require("../../index")

module.exports = {
    mode: 'development',
    entry: './src/index.js',
    externals: [
        new ExternalsMngt.Manager({
            summaryFile: './dist/bundle',
            rules: [{ 
                test: ExternalsMngt.is.builtIn("fs"),
                target: ExternalsMngt.lib.root()
            }]
        })
    ]
}
