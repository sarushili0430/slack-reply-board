import { describe, expect, test } from 'vitest';

import { createVectorStoreConfig } from './index.js';

describe('FR-RUNTIME-001 Local model services stay on loopback', () => {
  test('TEST-RUNTIME-UNIT-002 / AC-RUNTIME-001-02: Vector Store endpoint is loopback-only', () => {
    expect(
      createVectorStoreConfig({
        endpoint: 'http://localhost:6333',
        indexVersion: 'v1',
      }),
    ).toEqual({
      endpoint: 'http://localhost:6333',
      indexVersion: 'v1',
    });

    expect(
      createVectorStoreConfig({
        endpoint: 'http://127.0.0.1:6333',
        indexVersion: 'v1',
      }),
    ).toEqual({
      endpoint: 'http://127.0.0.1:6333',
      indexVersion: 'v1',
    });

    expect(
      createVectorStoreConfig({
        endpoint: 'http://[::1]:6333',
        indexVersion: 'v1',
      }),
    ).toEqual({
      endpoint: 'http://[::1]:6333',
      indexVersion: 'v1',
    });

    expect(() =>
      createVectorStoreConfig({
        endpoint: 'http://0.0.0.0:6333',
        indexVersion: 'v1',
      }),
    ).toThrow('Vector Store endpoint must use a loopback host.');

    expect(() =>
      createVectorStoreConfig({
        endpoint: 'https://vector.example.com',
        indexVersion: 'v1',
      }),
    ).toThrow('Vector Store endpoint must use a loopback host.');
  });
});
