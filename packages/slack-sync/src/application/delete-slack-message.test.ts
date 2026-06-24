import { describe, expect, test } from 'vitest';

import { createSlackEventId, type SlackEventId } from '../domain/slack-event-id.js';
import type {
  MessageIndex,
  MessageRepository,
  SlackMessageReference,
  SyncedSlackMessage,
} from '../ports/message-repository.js';
import { deleteSlackMessage } from './delete-slack-message.js';

class InMemoryMessageRepository implements MessageRepository {
  readonly messages = new Map<string, SyncedSlackMessage>();

  hasEventId(eventId: SlackEventId): Promise<boolean> {
    return Promise.resolve(
      [...this.messages.values()].some((message) => message.eventId === eventId),
    );
  }

  saveMessage(message: SyncedSlackMessage): Promise<boolean> {
    const key = createReferenceKey(message);
    const inserted = !this.messages.has(key);
    this.messages.set(key, message);
    return Promise.resolve(inserted);
  }

  deleteMessage(reference: SlackMessageReference): Promise<boolean> {
    return Promise.resolve(this.messages.delete(createReferenceKey(reference)));
  }
}

class InMemoryMessageIndex implements MessageIndex {
  readonly messages = new Map<string, SyncedSlackMessage>();
  readonly deletedReferences: SlackMessageReference[] = [];

  indexMessage(message: SyncedSlackMessage): Promise<void> {
    this.messages.set(createReferenceKey(message), message);
    return Promise.resolve();
  }

  deleteMessage(reference: SlackMessageReference): Promise<void> {
    this.messages.delete(createReferenceKey(reference));
    this.deletedReferences.push(reference);
    return Promise.resolve();
  }
}

function createReferenceKey(reference: SlackMessageReference): string {
  return `${reference.workspaceId}:${reference.channelId}:${reference.messageTs}`;
}

describe('FR-SYNC-001 Slack履歴の差分同期', () => {
  test('TEST-SYNC-UNIT-005 / AC-SYNC-001-03: 削除イベントはRaw StoreとKeyword/Vector Indexからメッセージを除去する', async () => {
    const messageRepository = new InMemoryMessageRepository();
    const keywordIndex = new InMemoryMessageIndex();
    const vectorIndex = new InMemoryMessageIndex();
    const message = {
      eventId: createSlackEventId('Ev-created'),
      workspaceId: 'T123',
      channelId: 'C123',
      messageTs: '1710000000.000600',
      text: '削除されるメッセージ',
    };
    const deletedEvent = {
      eventId: 'Ev-deleted',
      workspaceId: 'T123',
      channelId: 'C123',
      messageTs: '1710000000.000600',
      eventTime: '2026-06-23T10:05:00.000Z',
    };

    await messageRepository.saveMessage(message);
    await keywordIndex.indexMessage(message);
    await vectorIndex.indexMessage(message);

    const result = await deleteSlackMessage(deletedEvent, {
      messageRepository,
      keywordIndex,
      vectorIndex,
    });

    expect(result.deleted).toBe(true);
    expect(messageRepository.messages.size).toBe(0);
    expect(keywordIndex.messages.size).toBe(0);
    expect(vectorIndex.messages.size).toBe(0);
    expect(keywordIndex.deletedReferences).toEqual([
      expect.objectContaining({ channelId: 'C123', messageTs: '1710000000.000600' }),
    ]);
    expect(vectorIndex.deletedReferences).toEqual([
      expect.objectContaining({ channelId: 'C123', messageTs: '1710000000.000600' }),
    ]);
  });
});
