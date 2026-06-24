import { describe, expect, test } from 'vitest';

import { canSendDraft } from './draft-version.js';

describe('FR-DRAFT-001 Stale draft prevention', () => {
  test('TEST-DRAFT-UNIT-001 / AC-DRAFT-001-01: Draft生成後に新着が来たら送信できない', () => {
    expect(canSendDraft({ draftId: 'draft-1', threadVersion: 3 }, 4)).toBe(false);
  });
});
