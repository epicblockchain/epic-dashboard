import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createRequire} from 'node:module';
import {test} from 'node:test';
import {transformAsync} from '@babel/core';
import React from 'react';
import {jsx} from 'react/jsx-runtime';
import {renderToStaticMarkup} from 'react-dom/server';

const require = createRequire(import.meta.url);

test('React and React DOM use matching React 19 versions', () => {
    assert.match(React.version, /^19\./);
    assert.equal(require('react-dom/package.json').version, React.version);
});

test('the automatic JSX runtime creates elements the React 19 renderer accepts', () => {
    assert.equal(renderToStaticMarkup(jsx('div', {children: 'Dashboard'})), '<div>Dashboard</div>');
});

test('the app mounts through createRoot instead of the removed legacy render API', async () => {
    const source = await readFile(new URL('../src/app.jsx', import.meta.url), 'utf8');
    const {ast} = await transformAsync(source, {
        filename: 'app.jsx',
        babelrc: false,
        configFile: false,
        ast: true,
        code: false,
        presets: [['@babel/preset-react', {runtime: 'automatic'}]],
    });
    const imports = ast.program.body.filter((node) => node.type === 'ImportDeclaration');
    const client = imports.find((node) => node.source.value === 'react-dom/client');
    assert.equal(client.specifiers[0].imported.name, 'createRoot');
    assert.equal(
        imports.some((node) => node.source.value === 'react-dom'),
        false,
    );
    const mount = ast.program.body
        .flatMap((statement) => (statement.type === 'IfStatement' ? statement.consequent.body : [statement]))
        .map((statement) => statement.expression)
        .find(
            (expression) =>
                expression?.callee?.property?.name === 'render' &&
                expression.callee.object?.callee?.name === 'createRoot',
        );
    assert.ok(mount);
    assert.equal(mount.callee.property.name, 'render');
    assert.equal(mount.callee.object.callee.name, 'createRoot');
    assert.equal(mount.callee.object.arguments[0].name, 'rootElement');
    assert.match(source, /<RendererErrorBoundary>\s*<App \/>/);
});

test('the unsupported v7 table dependency is replaced without a compatibility shim', () => {
    const manifest = require('../package.json');
    assert.equal(manifest.dependencies['react-table'], undefined);
    assert.match(manifest.dependencies['@tanstack/react-table'], /^\^9\./);
});
