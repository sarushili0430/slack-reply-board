import { describe, expect, test } from 'vitest';

import { SlackOAuthCodeExchangeClient } from './index.js';

describe('FR-OAUTH-001 Slack OAuth connection', () => {
  test('TEST-OAUTH-CONTRACT-004 / AC-OAUTH-001-03: Slack OAuth code exchange maps to daemon completion input', async () => {
    const requests: { body: string; headers: Record<string, string>; url: string }[] = [];
    const client = new SlackOAuthCodeExchangeClient({
      fetch: (url, init) => {
        requests.push({
          body: init.body.toString(),
          headers: init.headers,
          url,
        });

        return Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              ok: true,
              access_token: 'xoxb-secret-token',
              team: {
                id: 'T123456',
              },
            }),
        });
      },
      tokenUrl: 'https://slack.example.test/api/oauth.v2.access',
    });

    const completionInput = await client.exchangeCode({
      clientId: '111.222',
      clientSecret: 'client-secret',
      code: 'oauth-code',
      redirectUri: 'http://127.0.0.1:3000/slack/oauth/callback',
    });

    expect(completionInput).toEqual({
      accessToken: 'xoxb-secret-token',
      workspaceId: 'T123456',
    });
    expect(requests).toHaveLength(1);
    expect(requests[0]).toEqual({
      body: 'client_id=111.222&client_secret=client-secret&code=oauth-code&redirect_uri=http%3A%2F%2F127.0.0.1%3A3000%2Fslack%2Foauth%2Fcallback',
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
      },
      url: 'https://slack.example.test/api/oauth.v2.access',
    });
  });

  test('TEST-OAUTH-CONTRACT-005 / AC-OAUTH-001-03: failed Slack OAuth responses are rejected', async () => {
    const client = new SlackOAuthCodeExchangeClient({
      fetch: () =>
        Promise.resolve({
          ok: true,
          status: 200,
          json: () =>
            Promise.resolve({
              ok: false,
              error: 'invalid_code',
            }),
        }),
    });

    await expect(
      client.exchangeCode({
        clientId: '111.222',
        clientSecret: 'client-secret',
        code: 'bad-code',
      }),
    ).rejects.toThrow('Slack OAuth exchange failed: invalid_code');
  });
});
