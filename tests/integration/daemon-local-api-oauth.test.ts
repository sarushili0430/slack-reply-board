import { afterEach, describe, expect, test } from 'vitest';

import { createLocalApiSessionToken, startLocalApiServer } from '../../apps/daemon/src/index.js';
import { completeSlackOAuthResponseSchema } from '../../packages/contracts/src/index.js';
import { completeSlackOAuth, type SlackTokenStore } from '../../packages/slack-sync/src/index.js';

const runtimes: { stop(): Promise<void> }[] = [];

afterEach(async () => {
  while (runtimes.length > 0) {
    await runtimes.pop()?.stop();
  }
});

describe('FR-OAUTH-001 Slack OAuth connection', () => {
  test('TEST-OAUTH-INTEGRATION-001 AC-OAUTH-001-02: daemon local API completes OAuth without returning the token', async () => {
    const savedTokens: { account: string; token: string; workspaceIdHash: string }[] = [];
    const tokenStore: SlackTokenStore = {
      saveToken: (reference, token) => {
        savedTokens.push({
          account: reference.keychainAccount,
          token,
          workspaceIdHash: reference.workspaceIdHash,
        });
        return Promise.resolve();
      },
    };
    const sessionToken = createLocalApiSessionToken({
      randomBytes: () => Buffer.alloc(32, 7),
    });
    const runtime = await startLocalApiServer({
      completeSlackOAuth: (request) =>
        completeSlackOAuth({
          ...request,
          tokenStore,
        }),
      host: '127.0.0.1',
      port: 0,
      sessionToken,
    });
    runtimes.push(runtime);

    const response = await fetch(`${runtime.origin}/slack/oauth/complete`, {
      body: JSON.stringify({
        accessToken: 'xoxb-secret-token',
        workspaceId: 'T123456',
      }),
      headers: {
        authorization: `Bearer ${sessionToken}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const payload: unknown = await response.json();
    const tokenReference = completeSlackOAuthResponseSchema.parse(payload);

    expect(response.status).toBe(200);
    expect(tokenReference.keychainAccount).toBe(
      `slack-workspace/${tokenReference.workspaceIdHash}`,
    );
    expect(JSON.stringify(payload)).not.toContain('xoxb-secret-token');
    expect(savedTokens).toEqual([
      {
        account: tokenReference.keychainAccount,
        token: 'xoxb-secret-token',
        workspaceIdHash: tokenReference.workspaceIdHash,
      },
    ]);

    await runtime.stop();
    runtimes.pop();
  });

  test('TEST-OAUTH-INTEGRATION-002 AC-OAUTH-001-02: daemon local API rejects invalid OAuth completion bodies', async () => {
    const savedTokens: string[] = [];
    const sessionToken = createLocalApiSessionToken({
      randomBytes: () => Buffer.alloc(32, 8),
    });
    const runtime = await startLocalApiServer({
      completeSlackOAuth: (request) =>
        completeSlackOAuth({
          ...request,
          tokenStore: {
            saveToken: (_reference, token) => {
              savedTokens.push(token);
              return Promise.resolve();
            },
          },
        }),
      host: '127.0.0.1',
      port: 0,
      sessionToken,
    });
    runtimes.push(runtime);

    const response = await fetch(`${runtime.origin}/slack/oauth/complete`, {
      body: JSON.stringify({
        workspaceId: 'T123456',
      }),
      headers: {
        authorization: `Bearer ${sessionToken}`,
        'content-type': 'application/json',
      },
      method: 'POST',
    });
    const payload: unknown = await response.json();

    expect(response.status).toBe(400);
    expect(payload).toEqual({ error: 'invalid_request' });
    expect(savedTokens).toEqual([]);

    await runtime.stop();
    runtimes.pop();
  });
});
