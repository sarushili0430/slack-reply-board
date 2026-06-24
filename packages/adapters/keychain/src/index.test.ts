import { describe, expect, test } from 'vitest';

import { createTokenReference } from './index.js';

describe('FR-OAUTH-001 Slack OAuth connection', () => {
  test('TEST-OAUTH-UNIT-001 / AC-OAUTH-001-01: Rendererへ返せるTokenReferenceにSlack Tokenを含めない', () => {
    const reference = createTokenReference('sha256:workspace', 'replyboard/T123');

    expect(Object.keys(reference)).toEqual(['workspaceIdHash', 'keychainAccount']);
    expect('token' in reference).toBe(false);
  });
});
