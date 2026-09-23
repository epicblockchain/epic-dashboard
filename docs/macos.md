# macOS releases

The public release workflow builds macOS releases on native runners for Intel (`x64`) and Apple silicon (`arm64`). It signs each app with the Developer ID Application certificate, enables hardened runtime, submits it to Apple's notary service, and validates the stapled ticket before uploading the ZIP to the GitHub release. If Forge fails after producing an app bundle but before creating its ZIP, the workflow staples and validates the app, then creates the ZIP. Before upload, recovery validates the ticket in an existing ZIP or staples and validates the app before repackaging it. Build or verification errors do not block upload when recovery confirms a valid notarization ticket.

Add these GitHub Actions repository secrets for the release workflow:

- `MACOS_EPICDASHBOARD_DEVELOPER_ID_CERTIFICATE_BASE64`: base64-encoded `.p12` export of the Developer ID Application certificate and private key.
- `MACOS_EPICDASHBOARD_DEVELOPER_ID_CERTIFICATE_PASSWORD`: password used to export that `.p12` file.
- `MACOS_EPICDASHBOARD_APPSTORE_CONNECT_API_KEY_BASE64`: base64-encoded App Store Connect Team API key `.p8` file.
- `MACOS_EPICDASHBOARD_APPSTORE_CONNECT_API_KEY_ID`: the key's 10-character Key ID.
- `MACOS_EPIC_APPSTORE_CONNECT_ISSUER_ID`: the App Store Connect Issuer ID.
- `MACOS_EPIC_DEVELOPER_IDENTITY`: exact signing identity name, such as `Developer ID Application: Example, Inc. (ABCDE12345)`.

The Apple Developer Program membership, Developer ID Application certificate, and an App Store Connect Team API key are required. Create a Team API key with App Manager access in App Store Connect; Apple lets you download its `.p8` file only once. Base64-encode the `.p8` file without line breaks for the API key secret. To create the certificate secret, export the certificate and private key from Keychain Access as a `.p12` file and base64-encode it.

For local notarization, you can store App Store Connect credentials in a `notarytool` Keychain profile instead of exporting API key variables. First save and validate the profile with `xcrun notarytool store-credentials`. Then set `APPLE_KEYCHAIN_PROFILE` to that profile name and `APPLE_SIGNING_IDENTITY` to the exact Developer ID Application identity installed in your Keychain. Builds without notarization credentials continue to use ad-hoc signing. Apple describes the notarization flow and the required Developer ID signature and hardened runtime in its [notarization documentation](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution).

On a Mac, `make mac` builds and signs both architectures. Signing macOS releases on Linux is not supported.

Choose the ARM64 ZIP on Apple silicon, or the x64 ZIP on an Intel Mac. The x64 app also runs through Rosetta on Apple silicon, but performance should be checked against the previous release rather than assuming every regression is caused by translation.

The Node 22 CI toolchain is separate from the Electron runtime shipped in the app. Release 4.10.0 shipped Electron 22.0.2; release 4.11.0 ships Electron 44.3.0, alongside React, MUI, table, and other dependency upgrades. Ad-hoc signing fixes invalid bundle signatures, not runtime performance regressions.
