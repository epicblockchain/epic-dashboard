# macOS releases

The public release workflow builds one universal DMG on an Apple silicon runner. The app contains native Intel (`x64`) and Apple silicon (`arm64`) executables. It signs the app with the Developer ID Application certificate, enables hardened runtime, submits it to Apple's notary service, and validates the stapled ticket. An intermediate ZIP supports recovery if Forge fails after notarization. The workflow then creates, signs, and notarizes the DMG, mounts it, and verifies the bundled app and both executable architectures before upload. Final DMG verification failures block publication.

## Signing credentials

Add these GitHub Actions repository secrets for the release workflow:

- `MACOS_EPICDASHBOARD_DEVELOPER_ID_CERTIFICATE_BASE64`: base64-encoded `.p12` export of the Developer ID Application certificate and private key.
- `MACOS_EPICDASHBOARD_DEVELOPER_ID_CERTIFICATE_PASSWORD`: password used to export that `.p12` file.
- `MACOS_EPICDASHBOARD_APPSTORE_CONNECT_API_KEY_BASE64`: base64-encoded App Store Connect Team API key `.p8` file.
- `MACOS_EPICDASHBOARD_APPSTORE_CONNECT_API_KEY_ID`: the key's 10-character Key ID.
- `MACOS_EPIC_APPSTORE_CONNECT_ISSUER_ID`: the App Store Connect Issuer ID.
- `MACOS_EPIC_DEVELOPER_IDENTITY`: exact signing identity name, such as `Developer ID Application: Example, Inc. (ABCDE12345)`.

The Apple Developer Program membership, Developer ID Application certificate, and an App Store Connect Team API key are required. Create a Team API key with App Manager access in App Store Connect; Apple lets you download its `.p8` file only once. Base64-encode the `.p8` file without line breaks for the API key secret. To create the certificate secret, export the certificate and private key from Keychain Access as a `.p12` file and base64-encode it.

For local notarization, you can store App Store Connect credentials in a `notarytool` Keychain profile instead of exporting API key variables. First save and validate the profile with `xcrun notarytool store-credentials`. Then set `APPLE_KEYCHAIN_PROFILE` to that profile name and `APPLE_SIGNING_IDENTITY` to the exact Developer ID Application identity installed in your Keychain. Builds without notarization credentials continue to use ad-hoc signing. Apple describes the notarization flow and the required Developer ID signature and hardened runtime in its [notarization documentation](https://developer.apple.com/documentation/security/notarizing-macos-software-before-distribution).

## Local builds

On a Mac, `make mac` creates separate Intel and Apple silicon ZIPs for local testing. These builds use ad-hoc signing by default, or Developer ID signing and notarization when the credentials above are configured. The release workflow creates the universal DMG. macOS packaging on Linux is not supported.

## Installation

Download `epic-dashboard-mac-<version>-universal.dmg` on either Apple silicon or Intel, open it, and drag the app into Applications. macOS selects the native executable for the machine.

The Node 22 CI toolchain is separate from the Electron runtime shipped in the app. Release 4.10.0 shipped Electron 22.0.2; release 4.11.0 ships Electron 44.3.0, alongside React, MUI, table, and other dependency upgrades. Ad-hoc signing fixes invalid bundle signatures, not runtime performance regressions.
