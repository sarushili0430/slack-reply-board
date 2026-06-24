export type KnowledgeChunk = {
  readonly id: string;
  readonly sourceId: string;
  readonly text: string;
  readonly indexVersion: string;
};

export function createKnowledgeChunk(input: KnowledgeChunk): KnowledgeChunk {
  if (input.text.trim().length === 0) {
    throw new Error('Knowledge chunk text must not be empty');
  }

  return input;
}
