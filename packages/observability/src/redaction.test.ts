import { describe, expect, test } from 'vitest';

import { redactStructuredLogRecord } from './redaction.js';

describe('FR-OBS-001 Sensitive log field redaction', () => {
  test('TEST-OBS-UNIT-001 / AC-OBS-001-01: 通常ログから本文・token・prompt・Qwen入力をredactする', () => {
    const record = redactStructuredLogRecord({
      level: 'info',
      operation: 'message.indexed',
      durationMs: 312,
      token: 'xoxb-secret-token',
      slackText: 'customer private slack body',
      draftText: 'draft answer body',
      messageTs: '1710000000.000100',
      nested: {
        prompt: 'full prompt body',
        rawQwenInput: 'raw model input',
        count: 2,
      },
    });

    expect(record).toEqual({
      level: 'info',
      operation: 'message.indexed',
      durationMs: 312,
      token: 'redacted',
      slackText: 'redacted',
      draftText: 'redacted',
      messageTs: 'redacted',
      nested: {
        prompt: 'redacted',
        rawQwenInput: 'redacted',
        count: 2,
      },
    });
    expect(JSON.stringify(record)).not.toContain('xoxb-secret-token');
    expect(JSON.stringify(record)).not.toContain('customer private slack body');
    expect(JSON.stringify(record)).not.toContain('full prompt body');
    expect(JSON.stringify(record)).not.toContain('raw model input');
  });
});
