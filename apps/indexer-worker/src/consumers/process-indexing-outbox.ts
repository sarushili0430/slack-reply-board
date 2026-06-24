import type { SyncedSlackMessage } from '@replyboard/slack-sync';

export type IndexerOutboxEvent = {
  readonly id: string;
  readonly eventId: string;
  readonly eventType: string;
  readonly idempotencyKey: string;
  readonly payload: unknown;
  readonly attemptCount: number;
};

export type IndexerOutboxQueue = {
  claimPendingEvents(limit: number): Promise<IndexerOutboxEvent[]>;
  markProcessed(id: string): Promise<void>;
};

export type IndexerMessageReader = {
  findMessageByEventId(eventId: string): Promise<SyncedSlackMessage | null>;
};

export type IdempotentMessageIndex = {
  indexMessage(
    message: SyncedSlackMessage,
    options: { readonly idempotencyKey: string },
  ): Promise<void>;
};

export type ProcessIndexingOutboxPorts = {
  readonly outboxQueue: IndexerOutboxQueue;
  readonly messageReader: IndexerMessageReader;
  readonly keywordIndex: IdempotentMessageIndex;
  readonly vectorIndex: IdempotentMessageIndex;
};

export type ProcessIndexingOutboxOptions = {
  readonly limit: number;
};

export type ProcessIndexingOutboxResult = {
  readonly claimed: number;
  readonly indexed: number;
  readonly missingMessages: number;
  readonly unsupportedEvents: number;
};

const indexRequestedEventType = 'slack_message.index_requested';

export async function processIndexingOutboxBatch(
  ports: ProcessIndexingOutboxPorts,
  options: ProcessIndexingOutboxOptions,
): Promise<ProcessIndexingOutboxResult> {
  const events = await ports.outboxQueue.claimPendingEvents(options.limit);
  let indexed = 0;
  let missingMessages = 0;
  let unsupportedEvents = 0;

  for (const event of events) {
    if (event.eventType !== indexRequestedEventType) {
      unsupportedEvents += 1;
      continue;
    }

    const message = await ports.messageReader.findMessageByEventId(event.eventId);

    if (message === null) {
      missingMessages += 1;
      continue;
    }

    const indexOptions = { idempotencyKey: event.idempotencyKey };
    await ports.keywordIndex.indexMessage(message, indexOptions);
    await ports.vectorIndex.indexMessage(message, indexOptions);
    await ports.outboxQueue.markProcessed(event.id);
    indexed += 1;
  }

  return {
    claimed: events.length,
    indexed,
    missingMessages,
    unsupportedEvents,
  };
}
