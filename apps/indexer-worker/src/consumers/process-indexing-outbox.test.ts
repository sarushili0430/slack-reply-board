import { describe, expect, test } from 'vitest';

import { createSlackEventId, type SyncedSlackMessage } from '@replyboard/slack-sync';

import {
  processIndexingOutboxBatch,
  type IdempotentMessageIndex,
  type IndexerMessageReader,
  type IndexerOutboxEvent,
  type IndexerOutboxQueue,
} from './process-indexing-outbox.js';

class InMemoryOutboxQueue implements IndexerOutboxQueue {
  readonly processedIds: string[] = [];

  constructor(private readonly events: readonly IndexerOutboxEvent[]) {}

  claimPendingEvents(): Promise<IndexerOutboxEvent[]> {
    return Promise.resolve([...this.events]);
  }

  markProcessed(id: string): Promise<void> {
    this.processedIds.push(id);
    return Promise.resolve();
  }
}

class InMemoryMessageReader implements IndexerMessageReader {
  constructor(private readonly message: SyncedSlackMessage | null) {}

  findMessageByEventId(): Promise<SyncedSlackMessage | null> {
    return Promise.resolve(this.message);
  }
}

class RecordingMessageIndex implements IdempotentMessageIndex {
  readonly calls: {
    readonly message: SyncedSlackMessage;
    readonly idempotencyKey: string;
  }[] = [];

  indexMessage(
    message: SyncedSlackMessage,
    options: { readonly idempotencyKey: string },
  ): Promise<void> {
    this.calls.push({ message, idempotencyKey: options.idempotencyKey });
    return Promise.resolve();
  }
}

function createMessage(): SyncedSlackMessage {
  return {
    eventId: createSlackEventId('Ev-indexer-1'),
    workspaceId: 'T-indexer',
    channelId: 'C-indexer',
    messageTs: '1710000000.000600',
    text: 'index this message',
  };
}

describe('FR-SYNC-001 Slack履歴の差分同期', () => {
  test('TEST-SYNC-UNIT-004 / AC-SYNC-001-02: outbox claimをRaw Messageからindexしてprocessedにする', async () => {
    const event: IndexerOutboxEvent = {
      id: 'slack-message-index:Ev-indexer-1',
      eventId: 'Ev-indexer-1',
      eventType: 'slack_message.index_requested',
      idempotencyKey: 'slack-message-index:Ev-indexer-1',
      payload: {
        eventId: 'Ev-indexer-1',
        workspaceId: 'T-indexer',
        channelId: 'C-indexer',
        messageTs: '1710000000.000600',
      },
      attemptCount: 1,
    };
    const message = createMessage();
    const outboxQueue = new InMemoryOutboxQueue([event]);
    const keywordIndex = new RecordingMessageIndex();
    const vectorIndex = new RecordingMessageIndex();

    const result = await processIndexingOutboxBatch(
      {
        outboxQueue,
        messageReader: new InMemoryMessageReader(message),
        keywordIndex,
        vectorIndex,
      },
      { limit: 10 },
    );

    expect(result).toEqual({
      claimed: 1,
      indexed: 1,
      missingMessages: 0,
      unsupportedEvents: 0,
    });
    expect(keywordIndex.calls).toEqual([{ message, idempotencyKey: event.idempotencyKey }]);
    expect(vectorIndex.calls).toEqual([{ message, idempotencyKey: event.idempotencyKey }]);
    expect(outboxQueue.processedIds).toEqual([event.id]);
  });
});
