import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {test} from 'node:test';

const require = createRequire(import.meta.url);
const manifest = require('../package.json');
const forge = require(`../${manifest.config.forge}`);

test('Forge retains the existing packaging targets and renderer entry point', () => {
    assert.equal(forge.packagerConfig.icon, 'src/img/epic');
    assert.deepEqual(
        forge.makers.map((maker) => maker.name),
        [
            '@electron-forge/maker-squirrel',
            '@electron-forge/maker-zip',
            '@electron-forge/maker-deb',
            '@electron-forge/maker-rpm',
        ],
    );
    const plugin = forge.plugins.find((item) => item.name === '@electron-forge/plugin-webpack');
    assert.equal(plugin.config.mainConfig, './webpack.main.config.js');
    assert.equal(plugin.config.renderer.nodeIntegration, true);
    assert.deepEqual(plugin.config.renderer.entryPoints, [
        {html: './src/index.html', js: './src/app.jsx', name: 'main_window'},
    ]);
});

test('macOS signing is ad-hoc, needs no certificate, and fails packaging on signing errors', () => {
    const sign = forge.packagerConfig.osxSign;
    assert.equal(sign.identity, '-');
    assert.equal(sign.identityValidation, false);
    assert.equal(sign.continueOnError, false);
    assert.equal(sign.preAutoEntitlements, false);
    assert.equal(sign.preEmbedProvisioningProfile, false);
    assert.deepEqual(sign.optionsForFile('epic-dashboard.app'), {hardenedRuntime: false, timestamp: 'none'});
    assert.equal(forge.packagerConfig.osxNotarize, undefined);
});

test('macOS releases build on native Mac runners with Node 22 and verify the actual uploaded ZIP', async () => {
    const workflow = await readFile(new URL('../.github/workflows/release.yml', import.meta.url), 'utf8');
    const mac = workflow.split('    build-mac:')[1].split('    create-release:')[0];
    assert.match(mac, /arch: x64\s+runner: macos-15-intel/);
    assert.match(mac, /arch: arm64\s+runner: macos-15\s+asset_arch: ARM64/);
    assert.match(mac, /node-version: '22'/);
    assert.match(mac, /unzip -q out\/make\/zip\/darwin/);
    assert.match(mac, /codesign --verify --deep --strict/);
    assert.match(mac, /ELECTRON_RUN_AS_NODE=1/);
    assert.match(workflow, /needs: \[prepare, build, build-mac\]/);
    assert.doesNotMatch(workflow.split('    build-mac:')[0], /make_target: mac/);
});
