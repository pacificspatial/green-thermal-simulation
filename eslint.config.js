import js from '@eslint/js'
import globals from 'globals'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'

export default [
    {
        ignores: ['dist/**', 'bin/**'],
    },

    {
        files: ['**/*.{js,jsx}'],
        languageOptions: {
            ecmaVersion: 2020,
            globals: globals.browser,
            parserOptions: {
                ecmaVersion: 'latest',
                ecmaFeatures: { jsx: true },
                sourceType: 'module',
            },
        },
        plugins: {
            react,
            'react-hooks': reactHooks,
            'react-refresh': reactRefresh,
        },
        rules: {
            ...js.configs.recommended.rules,
            ...react.configs.recommended.rules,
            ...react.configs['jsx-runtime'].rules,
            ...reactHooks.configs.recommended.rules,

            'no-unused-vars': ['warn'],
            'react/react-in-jsx-scope': 'off',
            'react/jsx-uses-react': 'off',
            'react-hooks/exhaustive-deps': 'off',
            'react-refresh/only-export-components': 'off',
            'react-hooks/preserve-manual-memoization': 'off',
            'react/display-name': 'off',
            'no-empty': ['error', { allowEmptyCatch: true }],
            'react/prop-types': 'off',
        },
        settings: {
            react: {
                version: 'detect',
            },
        },
    },
]