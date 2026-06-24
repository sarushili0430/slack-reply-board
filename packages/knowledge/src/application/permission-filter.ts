import type { KnowledgeChunk } from '../domain/chunk.js';

export type PermissionedKnowledgeChunk = KnowledgeChunk & {
  readonly channelId: string;
};

export function filterAccessibleChunks(
  chunks: readonly PermissionedKnowledgeChunk[],
  accessibleChannelIds: ReadonlySet<string>,
): readonly PermissionedKnowledgeChunk[] {
  return chunks.filter((chunk) => accessibleChannelIds.has(chunk.channelId));
}
