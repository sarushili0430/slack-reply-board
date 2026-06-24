import { describe, expect, test } from 'vitest';

import { filterActiveIndexVersionChunks } from './index-version-filter.js';

describe('FR-RAG-002 Retrieval uses the active index version', () => {
  test('TEST-RAG-UNIT-002 / AC-RAG-002-01: inactive index versions are excluded', () => {
    const results = filterActiveIndexVersionChunks(
      [
        {
          id: 'chunk-1',
          sourceId: 'C001:1',
          text: 'old embedding',
          indexVersion: 'embedding-v1',
        },
        {
          id: 'chunk-2',
          sourceId: 'C001:2',
          text: 'current embedding',
          indexVersion: 'embedding-v2',
        },
      ],
      'embedding-v2',
    );

    expect(results.map((chunk) => chunk.id)).toEqual(['chunk-2']);
  });
});
