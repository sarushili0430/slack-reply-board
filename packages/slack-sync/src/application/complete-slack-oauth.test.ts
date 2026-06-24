import { describe, expect, test } from 'vitest';

import { completeSlackOAuth } from './complete-slack-oauth.js';
import type { SlackTokenStore } from '../ports/slack-token-store.js';

describe('FR-OAUTH-001 Slack OAuth connection', () => {
  test('TEST-OAUTH-UNIT-003 AC-OAUTH-001-02: OAuth completion stores token and returns only a reference', async () => {
    const workspaceIdHash =
      'sha256:047f91c39524762a871344b62bc607418653f78a2e11fabb1dafb79968a99272';
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

    const tokenReference = await completeSlackOAuth({
      accessToken: 'xoxb-secret-token',
      tokenStore,
      workspaceId: 'T123456',
    });

    expect(tokenReference).toEqual({
      workspaceIdHash,
      keychainAccount: `slack-workspace/${workspaceIdHash}`,
    });
    expect(savedTokens).toEqual([
      {
        account: `slack-workspace/${workspaceIdHash}`,
        token: 'xoxb-secret-token',
        workspaceIdHash,
      },
    ]);
    expect(JSON.stringify(tokenReference)).not.toContain('xoxb-secret-token');
  });
});
