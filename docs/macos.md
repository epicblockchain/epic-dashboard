# macOS releases

Release builds use native macOS runners for both Intel (`x64`) and Apple silicon (`arm64`), with Node 22. Forge ad-hoc signs the completed app and its nested helpers/frameworks before creating the ZIP. CI verifies the signature and launches the native executable from the extracted release ZIP; signing failures fail the build.

Ad-hoc signing requires no Apple Developer account. It provides a valid local code signature, but does not identify a trusted publisher or provide Apple notarization. Downloaded apps may still require explicit approval in System Settings → Privacy & Security → Open Anyway. Only approve a release whose source and download you trust; do not disable Gatekeeper globally.

On a Mac, `make mac` builds and signs both architectures. Signing macOS releases on Linux is not supported.

Choose the ARM64 ZIP on Apple silicon, or the x64 ZIP on an Intel Mac. The x64 app also runs through Rosetta on Apple silicon, but performance should be checked against the previous release rather than assuming every regression is caused by translation.

The Node 22 CI toolchain is separate from the Electron runtime shipped in the app. Release 4.10.0 shipped Electron 22.0.2; release 4.11.0 ships Electron 44.3.0, alongside React, MUI, table, and other dependency upgrades. Ad-hoc signing fixes invalid bundle signatures, not runtime performance regressions.
