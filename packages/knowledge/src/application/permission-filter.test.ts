import { describe, expect, test } from 'vitest';

import { filterAccessibleChunks, type PermissionedKnowledgeChunk } from './permission-filter.js';

describe('FR-RAG-001 Permission-aware retrieval', () => {
  test('AC-RAG-001-01: access喪失したチャンネルのチャンクを検索結果から除外する', () => {
    const chunks: readonly PermissionedKnowledgeChunk[] = [
      {
        id: 'chunk-1',
        sourceId: 'C-ALLOWED:1',
        channelId: 'C-ALLOWED',
        text: 'allowed',
        indexVersion: 'initial',
      },
      {
        id: 'chunk-2',
        sourceId: 'C-FORBIDDEN:1',
        channelId: 'C-FORBIDDEN',
        text: 'forbidden',
        indexVersion: 'initial',
      },
    ];

    const results = filterAccessibleChunks(chunks, new Set(['C-ALLOWED']));

    expect(results.map((chunk) => chunk.id)).toEqual(['chunk-1']);
  });
});
