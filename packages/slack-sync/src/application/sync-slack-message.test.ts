import { describe, expect, test } from 'vitest';

import type { SlackEventId } from '../domain/slack-event-id.js';
import type {
  MessageIndex,
  MessageRepository,
  SyncedSlackMessage,
} from '../ports/message-repository.js';
import { syncSlackMessage } from './sync-slack-message.js';

class InMemoryMessageRepository implements MessageRepository {
  readonly messages = new Map<SlackEventId, SyncedSlackMessage>();

  hasEventId(eventId: SlackEventId): Promise<boolean> {
    return Promise.resolve(this.messages.has(eventId));
  }

  saveMessage(message: SyncedSlackMessage): Promise<void> {
    this.messages.set(message.eventId, message);
    return Promise.resolve();
  }
}

class InMemoryMessageIndex implements MessageIndex {
  readonly messages: SyncedSlackMessage[] = [];

  indexMessage(message: SyncedSlackMessage): Promise<void> {
    this.messages.push(message);
    return Promise.resolve();
  }
}

describe('FR-SYNC-001 Slack履歴の差分同期', () => {
  test('TEST-SYNC-UNIT-001 / AC-SYNC-001-01: 同じSlack event_idを2回受信しても一度だけ保存する', async () => {
    const messageRepository = new InMemoryMessageRepository();
    const keywordIndex = new InMemoryMessageIndex();
    const vectorIndex = new InMemoryMessageIndex();
    const event = {
      eventId: 'Ev123',
      workspaceId: 'T123',
      channelId: 'C123',
      messageTs: '1710000000.000100',
      text: '確認お願いします',
      eventTime: '2026-06-23T10:00:00.000Z',
    };

    await syncSlackMessage(event, { messageRepository, keywordIndex, vectorIndex });
    await syncSlackMessage(event, { messageRepository, keywordIndex, vectorIndex });

    expect(messageRepository.messages.size).toBe(1);
    expect(keywordIndex.messages).toHaveLength(1);
    expect(vectorIndex.messages).toHaveLength(1);
  });

  test('TEST-SYNC-UNIT-002 / AC-SYNC-001-02: 新規メッセージをRaw Storeと各Indexへ反映する', async () => {
    const messageRepository = new InMemoryMessageRepository();
    const keywordIndex = new InMemoryMessageIndex();
    const vectorIndex = new InMemoryMessageIndex();
    const event = {
      eventId: 'Ev124',
      workspaceId: 'T123',
      channelId: 'C123',
      messageTs: '1710000000.000200',
      text: '検索に反映してください',
      eventTime: '2026-06-23T10:00:00.000Z',
    };

    const result = await syncSlackMessage(event, { messageRepository, keywordIndex, vectorIndex });

    expect(result.stored).toBe(true);
    expect([...messageRepository.messages.values()]).toEqual([
      expect.objectContaining({ channelId: 'C123', text: '検索に反映してください' }),
    ]);
    expect(keywordIndex.messages).toEqual([
      expect.objectContaining({ channelId: 'C123', text: '検索に反映してください' }),
    ]);
    expect(vectorIndex.messages).toEqual([
      expect.objectContaining({ channelId: 'C123', text: '検索に反映してください' }),
    ]);
  });
});
