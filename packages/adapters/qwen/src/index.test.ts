import { describe, expect, test } from 'vitest';

import { createQwenRuntimeConfig } from './index.js';

describe('FR-RUNTIME-001 Local model services stay on loopback', () => {
  test('TEST-RUNTIME-UNIT-001 / AC-RUNTIME-001-01: Qwen endpoint is loopback-only', () => {
    expect(
      createQwenRuntimeConfig({
        baseUrl: 'http://localhost:11434',
        model: 'qwen3',
      }),
    ).toEqual({
      baseUrl: 'http://localhost:11434',
      model: 'qwen3',
    });

    expect(
      createQwenRuntimeConfig({
        baseUrl: 'http://127.0.0.1:11434',
        model: 'qwen3',
      }),
    ).toEqual({
      baseUrl: 'http://127.0.0.1:11434',
      model: 'qwen3',
    });

    expect(
      createQwenRuntimeConfig({
        baseUrl: 'http://[::1]:11434',
        model: 'qwen3',
      }),
    ).toEqual({
      baseUrl: 'http://[::1]:11434',
      model: 'qwen3',
    });

    expect(() =>
      createQwenRuntimeConfig({
        baseUrl: 'http://0.0.0.0:11434',
        model: 'qwen3',
      }),
    ).toThrow('Qwen baseUrl must use a loopback host.');

    expect(() =>
      createQwenRuntimeConfig({
        baseUrl: 'http://192.168.1.20:11434',
        model: 'qwen3',
      }),
    ).toThrow('Qwen baseUrl must use a loopback host.');
  });
});
