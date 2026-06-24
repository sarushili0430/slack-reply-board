import { describe, expect, test } from 'vitest';

import { assertHermesToolCallBudget } from './tool-call-budget.js';

describe('FR-HERMES-001 Restricted tool access', () => {
  test('TEST-HERMES-UNIT-002 / AC-HERMES-001-02: 最大Tool Call数を超える呼び出しを拒否する', () => {
    expect(() => {
      assertHermesToolCallBudget({
        currentToolCallCount: 2,
        maxToolCalls: 3,
      });
    }).not.toThrow();

    expect(() => {
      assertHermesToolCallBudget({
        currentToolCallCount: 3,
        maxToolCalls: 3,
      });
    }).toThrow(/Tool call budget exceeded/u);
  });
});
