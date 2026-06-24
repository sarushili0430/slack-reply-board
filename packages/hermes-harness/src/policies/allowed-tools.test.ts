import { describe, expect, test } from 'vitest';

import { allowedHermesTools, isAllowedHermesTool } from './allowed-tools.js';

describe('FR-HERMES-001 Restricted tool access', () => {
  test('TEST-HERMES-UNIT-001 / AC-HERMES-001-01: HermesからSlack投稿ツールを利用できない', () => {
    expect(allowedHermesTools.some((toolName) => toolName.includes('slack.post'))).toBe(false);
    expect(isAllowedHermesTool('replyboard.slack_post')).toBe(false);
  });
});
