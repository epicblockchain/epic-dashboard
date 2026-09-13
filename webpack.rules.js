module.exports = [
    // Add support for native node modules
    {
        test: /\.node$/,
        use: 'node-loader',
    },
    {
        test: /\.(m?js|node)$/,
        parser: {amd: false},
        use: {
            loader: '@vercel/webpack-asset-relocator-loader',
            options: {
                outputAssetBase: 'native_modules',
            },
        },
    },
    {
        test: /\.jsx?$/,
        exclude: /node_modules/,
        use: {
            loader: 'babel-loader',
            options: {
                targets: {electron: require('electron/package.json').version},
                presets: [['@babel/preset-react', {runtime: 'automatic', development: false}], '@babel/preset-env'],
                plugins: [
                    [
                        'babel-plugin-polyfill-corejs3',
                        {
                            method: 'usage-global',
                            version: require('core-js/package.json').version,
                        },
                    ],
                ],
            },
        },
    },
    {
        test: /\.(png|jpe?g|gif)$/i,
        use: [
            {
                loader: 'url-loader',
                options: {
                    limit: 32768,
                },
            },
        ],
    },
    // Put your webpack loader rules in this array.  This is where you would put
    // your ts-loader configuration for instance:
    /**
     * Typescript Example:
     *
     * {
     *   test: /\.tsx?$/,
     *   exclude: /(node_modules|.webpack)/,
     *   loaders: [{
     *     loader: 'ts-loader',
     *     options: {
     *       transpileOnly: true
     *     }
     *   }]
     * }
     */
];
