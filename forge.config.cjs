const forge = {
    packagerConfig: {
        icon: 'src/img/epic',
    },
    makers: [
        {
            name: '@electron-forge/maker-squirrel',
            config: {
                name: 'epic-dashboard',
            },
        },
        {
            name: '@electron-forge/maker-zip',
        },
        {
            name: '@electron-forge/maker-deb',
            config: {
                options: {
                    icon: 'src/img/epic.png',
                },
            },
        },
        {
            name: '@electron-forge/maker-rpm',
            config: {
                options: {
                    icon: 'src/img/epic.png',
                },
            },
        },
    ],
    plugins: [
        {
            name: '@electron-forge/plugin-webpack',
            config: {
                mainConfig: './webpack.main.config.js',
                renderer: {
                    config: './webpack.renderer.config.js',
                    nodeIntegration: true,
                    entryPoints: [
                        {
                            html: './src/index.html',
                            js: './src/app.jsx',
                            name: 'main_window',
                        },
                    ],
                },
            },
        },
    ],
};

// Ad-hoc signing requires macOS, but does not require an Apple Developer account.
forge.packagerConfig.osxSign = {
    identity: '-',
    identityValidation: false,
    continueOnError: false,
    preAutoEntitlements: false,
    preEmbedProvisioningProfile: false,
    optionsForFile: () => ({hardenedRuntime: false, timestamp: 'none'}),
};

module.exports = forge;
