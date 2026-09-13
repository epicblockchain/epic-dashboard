import js from '@eslint/js';
import {defineConfig, globalIgnores} from 'eslint/config';
import prettier from 'eslint-config-prettier/flat';
import globals from 'globals';

export default defineConfig([
    globalIgnores(['**/node_modules/**', '**/out/**', '**/.webpack/**', '**/*.swp', '**/.vscode/**']),
    {
        files: ['**/*.{js,jsx,mjs,cjs}'],
        extends: [js.configs.recommended],
        languageOptions: {
            ecmaVersion: 'latest',
            parserOptions: {ecmaFeatures: {jsx: true}},
        },
        linterOptions: {reportUnusedDisableDirectives: 'error'},
        rules: {
            'guard-for-in': 'error',
            'no-caller': 'error',
            'no-extend-native': 'error',
            'no-extra-bind': 'error',
            'no-invalid-this': 'error',
            'no-multi-str': 'error',
            'no-new-wrappers': 'error',
            'no-throw-literal': 'error',
            'prefer-promise-reject-errors': 'error',
            'no-unused-vars': ['error', {args: 'none', ignoreRestSiblings: true}],
            'new-cap': 'error',
            'no-array-constructor': 'error',
            'no-object-constructor': 'error',
            'no-var': 'error',
            'prefer-const': ['error', {destructuring: 'all'}],
            'prefer-rest-params': 'error',
            'prefer-spread': 'error',
        },
    },
    {
        files: ['webpack*.js', '**/*.cjs', 'src/portscan.js'],
        languageOptions: {sourceType: 'commonjs', globals: globals.node},
    },
    {
        files: ['**/*.mjs'],
        languageOptions: {globals: globals.nodeBuiltin},
    },
    {
        files: ['src/main.js'],
        languageOptions: {
            globals: {...globals.node, MAIN_WINDOW_WEBPACK_ENTRY: 'readonly'},
        },
    },
    {
        files: ['src/**/*.jsx', 'src/rendererHttp.js'],
        // The Electron renderer intentionally has Node integration enabled.
        languageOptions: {globals: {...globals.browser, ...globals.node}},
    },
    prettier,
]);
