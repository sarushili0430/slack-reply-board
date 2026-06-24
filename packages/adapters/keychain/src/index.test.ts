import { describe, expect, test } from 'vitest';

import { MacosKeychainSlackTokenStore, createTokenReference } from './index.js';

describe('FR-OAUTH-001 Slack OAuth connection', () => {
  test('TEST-OAUTH-UNIT-001 / AC-OAUTH-001-01: Rendererへ返せるTokenReferenceにSlack Tokenを含めない', () => {
    const reference = createTokenReference('sha256:workspace', 'replyboard/T123');

    expect(Object.keys(reference)).toEqual(['workspaceIdHash', 'keychainAccount']);
    expect('token' in reference).toBe(false);
  });

  test('TEST-OAUTH-UNIT-002 / AC-OAUTH-001-01: Slack TokenをOS Keychain entryへ保存してTokenReferenceへ混ぜない', async () => {
    const calls: string[] = [];
    let storedPassword: string | null = null;
    const store = new MacosKeychainSlackTokenStore({
      serviceName: 'slack-reply-board-test',
      createEntry: (serviceName, accountName) => {
        calls.push(`${serviceName}:${accountName}`);

        return {
          setPassword: (password: string) => {
            storedPassword = password;
          },
          getPassword: () => storedPassword,
          deleteCredential: () => {
            const existed = storedPassword !== null;
            storedPassword = null;
            return existed;
          },
        };
      },
    });
    const reference = createTokenReference('sha256:workspace', 'replyboard/T123');

    await store.saveToken(reference, 'xoxb-secret-token');

    expect(await store.readToken(reference)).toBe('xoxb-secret-token');
    expect(await store.deleteToken(reference)).toBe(true);
    expect(await store.readToken(reference)).toBeNull();
    expect(Object.keys(reference)).toEqual(['workspaceIdHash', 'keychainAccount']);
    expect(JSON.stringify(reference)).not.toContain('xoxb-secret-token');
    expect(calls).toEqual([
      'slack-reply-board-test:replyboard/T123',
      'slack-reply-board-test:replyboard/T123',
      'slack-reply-board-test:replyboard/T123',
      'slack-reply-board-test:replyboard/T123',
    ]);
  });
});
