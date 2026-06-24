import type { KnowledgeChunk } from '../domain/chunk.js';

export function filterActiveIndexVersionChunks(
  chunks: readonly KnowledgeChunk[],
  activeIndexVersion: string,
): readonly KnowledgeChunk[] {
  return chunks.filter((chunk) => chunk.indexVersion === activeIndexVersion);
}
