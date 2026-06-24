import { createKnowledgeChunk, type KnowledgeChunk } from '@replyboard/knowledge';

export function chunkMessageText(messageId: string, text: string): KnowledgeChunk {
  return createKnowledgeChunk({
    id: `${messageId}:0`,
    sourceId: messageId,
    text,
    indexVersion: 'initial',
  });
}
