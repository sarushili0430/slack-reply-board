import { resolve } from 'node:path';

import { defineConfig } from 'vitest/config';

const rootDir = import.meta.dirname;
const workspaceSourceAliases = [
  ['@replyboard/adapters-filesystem', 'packages/adapters/filesystem/src/index.ts'],
  ['@replyboard/adapters-keychain', 'packages/adapters/keychain/src/index.ts'],
  ['@replyboard/adapters-qwen', 'packages/adapters/qwen/src/index.ts'],
  ['@replyboard/adapters-slack', 'packages/adapters/slack/src/index.ts'],
  ['@replyboard/adapters-sqlite', 'packages/adapters/sqlite/src/index.ts'],
  ['@replyboard/adapters-vector-store', 'packages/adapters/vector-store/src/index.ts'],
  ['@replyboard/board', 'packages/board/src/index.ts'],
  ['@replyboard/contracts', 'packages/contracts/src/index.ts'],
  ['@replyboard/drafting', 'packages/drafting/src/index.ts'],
  ['@replyboard/hermes-harness', 'packages/hermes-harness/src/index.ts'],
  ['@replyboard/knowledge', 'packages/knowledge/src/index.ts'],
  ['@replyboard/observability', 'packages/observability/src/index.ts'],
  ['@replyboard/slack-sync', 'packages/slack-sync/src/index.ts'],
  ['@replyboard/testkit', 'packages/testkit/src/index.ts'],
].map(([find, sourcePath]) => ({
  find,
  replacement: resolve(rootDir, sourcePath),
}));
const workspaceResolve = {
  alias: workspaceSourceAliases,
};

export default defineConfig({
  resolve: workspaceResolve,
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
    projects: [
      {
        resolve: workspaceResolve,
        test: {
          name: 'unit',
          include: ['packages/**/src/**/*.test.ts', 'apps/**/src/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'packages/adapters/**/src/**/*.contract.test.ts'],
        },
      },
      {
        resolve: workspaceResolve,
        test: {
          name: 'contract',
          include: [
            'packages/adapters/**/src/**/*.contract.test.ts',
            'tests/contract/**/*.test.ts',
          ],
          exclude: ['**/node_modules/**'],
        },
      },
      {
        resolve: workspaceResolve,
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          exclude: ['**/node_modules/**'],
        },
      },
      {
        resolve: workspaceResolve,
        test: {
          name: 'acceptance',
          include: ['tests/acceptance/**/*.test.ts'],
          exclude: ['**/node_modules/**'],
        },
      },
    ],
  },
});
