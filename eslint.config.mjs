import js from '@eslint/js';
import { defineConfig, globalIgnores } from 'eslint/config';
import eslintConfigPrettier from 'eslint-config-prettier/flat';
import globals from 'globals';
import tseslint from 'typescript-eslint';

export default defineConfig(
  globalIgnores([
    '**/dist/**',
    '**/out/**',
    '**/coverage/**',
    '**/.vite/**',
    '**/generated/**',
    '**/node_modules/**',
  ]),

  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 2023,
      sourceType: 'module',
      globals: {
        ...globals.node,
      },
    },
    rules: {
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
    },
  },

  {
    files: ['scripts/**/*.{js,mjs,cjs}', '*.config.{js,mjs,cjs}'],
    rules: {
      'no-console': 'off',
    },
  },

  {
    files: ['**/*.{ts,tsx,mts,cts}'],
    extends: [
      js.configs.recommended,
      tseslint.configs.strictTypeChecked,
      tseslint.configs.stylisticTypeChecked,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      '@typescript-eslint/switch-exhaustiveness-check': 'error',
      '@typescript-eslint/consistent-type-imports': 'error',
      '@typescript-eslint/consistent-type-definitions': ['error', 'type'],
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-unnecessary-condition': 'error',
      '@typescript-eslint/require-await': 'error',
      'no-console': 'error',
      eqeqeq: ['error', 'always'],
      curly: ['error', 'all'],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['@replyboard/*/src/*'],
              message: 'Use package public exports instead of deep imports.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/consistent-type-definitions': 'off',
    },
  },

  {
    files: ['**/*.test.{ts,tsx}', 'tests/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
    },
  },

  {
    files: ['apps/desktop/src/renderer/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'electron',
              message: 'Renderer must use the preload API boundary, not Electron directly.',
            },
          ],
          patterns: [
            {
              group: ['node:*', 'fs', 'path', 'child_process', 'better-sqlite3'],
              message: 'Renderer must not import Node.js, Slack, or DB APIs.',
            },
            {
              group: ['@replyboard/*/src/*'],
              message: 'Use package public exports instead of deep imports.',
            },
          ],
        },
      ],
    },
  },

  {
    files: ['packages/*/src/domain/**/*.{ts,tsx}'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: [
                '@replyboard/adapters*',
                '@slack/*',
                'electron',
                'better-sqlite3',
                '@modelcontextprotocol/*',
              ],
              message: 'Domain code must not depend on adapters or external technology SDKs.',
            },
            {
              group: ['@replyboard/*/src/*'],
              message: 'Use package public exports instead of deep imports.',
            },
          ],
        },
      ],
    },
  },

  eslintConfigPrettier,
);
