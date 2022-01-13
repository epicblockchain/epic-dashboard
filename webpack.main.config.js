module.exports = {
    /**
     * This is the main entry point for your application, it's the first file
     * that runs in the main process.
     */
    entry: {
        index: './src/main.js',
        portscan: './src/portscan.js',
    },
    output: {
        filename: '[name].js',
        sourceMapFilename: '[name].js.map',
    },
    // Put your normal webpack config below here
    module: {
        rules: require('./webpack.rules'),
    },
};
