import { Buffer } from 'node:buffer';
import { describe, expect, test } from 'vitest';

import { localApiSessionTokenSchema } from '@replyboard/contracts';

import { createLocalApiSessionToken, isLocalApiRequestAuthorized } from './session-token.js';

describe('FR-LOCAL-001 Local API session protection', () => {
  test('TEST-LOCAL-UNIT-001 / AC-LOCAL-001-01: local APIはランダムsession tokenのBearer提示だけを許可する', () => {
    const sessionToken = createLocalApiSessionToken({
      randomBytes: (size) => Buffer.alloc(size, 7),
    });

    expect(localApiSessionTokenSchema.parse(sessionToken)).toBe(sessionToken);
    expect(sessionToken).toHaveLength(43);
    expect(
      isLocalApiRequestAuthorized({
        authorizationHeader: `Bearer ${sessionToken}`,
        sessionToken,
      }),
    ).toBe(true);
    expect(
      isLocalApiRequestAuthorized({
        authorizationHeader: undefined,
        sessionToken,
      }),
    ).toBe(false);
    expect(
      isLocalApiRequestAuthorized({
        authorizationHeader: sessionToken,
        sessionToken,
      }),
    ).toBe(false);
    expect(
      isLocalApiRequestAuthorized({
        authorizationHeader: 'Bearer wrong-token',
        sessionToken,
      }),
    ).toBe(false);
  });
});
