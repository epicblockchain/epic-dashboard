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

// Local macOS builds remain ad-hoc signed unless notarization credentials and a
// Developer ID certificate are configured. Credentials can come from either a
// notarytool Keychain profile or App Store Connect API key values.
const appleApiKey = process.env.APPLE_API_KEY;
const appleApiKeyId = process.env.APP_STORE_CONNECT_API_KEY_ID;
const appleApiIssuer = process.env.APP_STORE_CONNECT_ISSUER_ID;
const keychainProfile = process.env.APPLE_KEYCHAIN_PROFILE;
const developerId = process.env.APPLE_SIGNING_IDENTITY;
const apiCredentials = [appleApiKey, appleApiKeyId, appleApiIssuer];
const hasApiCredentials = apiCredentials.some(Boolean);
const completeApiCredentials = apiCredentials.every(Boolean);

if (hasApiCredentials && !completeApiCredentials) {
    throw new Error('Set APPLE_API_KEY, APP_STORE_CONNECT_API_KEY_ID, and APP_STORE_CONNECT_ISSUER_ID together');
}

if ((keychainProfile || completeApiCredentials) && !developerId) {
    throw new Error('APPLE_SIGNING_IDENTITY is required when macOS notarization is configured');
}

if (keychainProfile && completeApiCredentials) {
    throw new Error('Configure either APPLE_KEYCHAIN_PROFILE or App Store Connect API key values, not both');
}

const notarizationConfigured = Boolean(developerId && (keychainProfile || completeApiCredentials));

forge.packagerConfig.osxSign = notarizationConfigured
    ? {
          identity: developerId,
          identityValidation: true,
          continueOnError: false,
          optionsForFile: () => ({
              hardenedRuntime: true,
              timestamp: 'http://timestamp.apple.com/ts01',
          }),
      }
    : {
          identity: '-',
          identityValidation: false,
          continueOnError: false,
          preAutoEntitlements: false,
          preEmbedProvisioningProfile: false,
          optionsForFile: () => ({hardenedRuntime: false, timestamp: 'none'}),
      };

if (notarizationConfigured) {
    forge.packagerConfig.osxNotarize = keychainProfile
        ? {keychainProfile}
        : {appleApiKey, appleApiKeyId, appleApiIssuer};
}

module.exports = forge;
