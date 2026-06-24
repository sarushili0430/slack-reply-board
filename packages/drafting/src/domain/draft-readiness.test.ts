import { describe, expect, test } from 'vitest';

import { determineDraftReadiness } from './draft-readiness.js';

describe('FR-DRAFT-002 Unsupported claims require human review', () => {
  test('TEST-DRAFT-UNIT-002 / AC-DRAFT-002-01: unsupported claims route to needs_me', () => {
    expect(
      determineDraftReadiness({
        unsupportedClaims: ['release date was not found in retrieved sources'],
      }),
    ).toBe('needs_me');

    expect(
      determineDraftReadiness({
        unsupportedClaims: [],
      }),
    ).toBe('draft_ready');
  });
});
