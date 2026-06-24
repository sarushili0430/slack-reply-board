import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov'],
    },
    projects: [
      {
        test: {
          name: 'unit',
          include: ['packages/**/src/**/*.test.ts', 'apps/**/src/**/*.test.ts'],
          exclude: ['**/node_modules/**', 'packages/adapters/**/src/**/*.contract.test.ts'],
        },
      },
      {
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
        test: {
          name: 'integration',
          include: ['tests/integration/**/*.test.ts'],
          exclude: ['**/node_modules/**'],
        },
      },
      {
        test: {
          name: 'acceptance',
          include: ['tests/acceptance/**/*.test.ts'],
          exclude: ['**/node_modules/**'],
        },
      },
    ],
  },
});
