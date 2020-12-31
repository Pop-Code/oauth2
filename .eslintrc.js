module.exports = {
    env: {
        node: true
    },
    parserOptions: {
        project: './tsconfig.json'
    },
    ignorePatterns: ['dist/test/*', 'typedoc.js'],
    extends: ['standard-with-typescript', 'prettier', 'prettier/@typescript-eslint'],
    root: true,
    rules: {
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-empty-interface': 'off'
    },
    overrides: [
        {
            files: [`./packages/*/src/**/module.ts`, `./packages/*/src/**/module.core.ts`],
            rules: {
                '@typescript-eslint/no-extraneous-class': 'off'
            }
        },
        // CORE
        {
            files: [`./packages/core/*`],
            rules: {
                'import/no-extraneous-dependencies': ['error', { packageDir: [`./packages/core`] }]
            }
        },
        {
            files: [`./packages/core/**/test/**/*`, `./packages/common/jest.config.js`],
            rules: {
                'import/no-extraneous-dependencies': ['error', { packageDir: [`./packages/core`, `./`] }]
            }
        },
        // COMMON
        {
            files: [`./packages/common/*`],
            rules: {
                'import/no-extraneous-dependencies': ['error', { packageDir: [`./packages/common`] }]
            }
        },
        {
            files: [`./packages/common/**/test/**/*`, `./packages/common/jest.config.js`],
            rules: {
                'import/no-extraneous-dependencies': ['error', { packageDir: [`./packages/common`, `./`] }]
            }
        },
        // CLIENT CREDENTIALS CORE
        {
            files: [`./packages/client-credentials/core/*`],
            rules: {
                'import/no-extraneous-dependencies': ['error', { packageDir: [`./packages/client-credentials/core`] }]
            }
        },
        {
            files: [
                `./packages/client-credentials/packages/core/**/test/**/*`,
                `./packages/client-credentials/packages/core/jest.config.js`
            ],
            rules: {
                'import/no-extraneous-dependencies': [
                    'error',
                    { packageDir: [`./packages/client-credentials/packages/core`, `./`] }
                ]
            }
        },
        // CLIENT CREDENTIALS EXPRESS
        {
            files: [`./packages/client-credentials/express/*`],
            rules: {
                'import/no-extraneous-dependencies': [
                    'error',
                    { packageDir: [`./packages/client-credentials/packages/express`] }
                ]
            }
        },
        {
            files: [
                `./packages/client-credentials/packages/express/**/test/**/*`,
                `./packages/client-credentials/packages/express/jest.config.js`
            ],
            rules: {
                'import/no-extraneous-dependencies': [
                    'error',
                    { packageDir: [`./packages/client-credentials/packages/express`, `./`] }
                ]
            }
        },
        {
            files: [
                `./packages/client-credentials/packages/fastify/**/test/**/*`,
                `./packages/client-credentials/packages/fastify/jest.config.js`
            ],
            rules: {
                'import/no-extraneous-dependencies': [
                    'error',
                    { packageDir: [`./packages/client-credentials/packages/fastify`, `./`] }
                ]
            }
        }
    ]
};
