import { describe, expect, test } from 'vitest';

import { createLocalApiListenOptions } from './listen-options.js';

describe('FR-LOCAL-002 Local API listens only on loopback', () => {
  test('TEST-LOCAL-UNIT-002 / AC-LOCAL-002-01: non-loopback local API hosts are rejected', () => {
    expect(createLocalApiListenOptions({ host: 'localhost', port: 43120 })).toEqual({
      host: 'localhost',
      port: 43120,
    });
    expect(createLocalApiListenOptions({ host: '127.0.0.1', port: 43120 })).toEqual({
      host: '127.0.0.1',
      port: 43120,
    });
    expect(createLocalApiListenOptions({ host: '::1', port: 43120 })).toEqual({
      host: '::1',
      port: 43120,
    });

    expect(() => createLocalApiListenOptions({ host: '0.0.0.0', port: 43120 })).toThrow(
      'Local API host must use a loopback interface.',
    );
    expect(() => createLocalApiListenOptions({ host: '192.168.1.20', port: 43120 })).toThrow(
      'Local API host must use a loopback interface.',
    );
  });
});
