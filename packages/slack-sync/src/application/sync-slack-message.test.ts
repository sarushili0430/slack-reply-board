import { describe, expect, test } from 'vitest';

import type { SlackEventId } from '../domain/slack-event-id.js';
import type { MessageRepository, SyncedSlackMessage } from '../ports/message-repository.js';
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

describe('FR-SYNC-001 Slack履歴の差分同期', () => {
  test('AC-SYNC-001-01: 同じSlack event_idを2回受信しても一度だけ保存する', async () => {
    const messageRepository = new InMemoryMessageRepository();
    const event = {
      eventId: 'Ev123',
      workspaceId: 'T123',
      channelId: 'C123',
      messageTs: '1710000000.000100',
      text: '確認お願いします',
      eventTime: '2026-06-23T10:00:00.000Z',
    };

    await syncSlackMessage(event, { messageRepository });
    await syncSlackMessage(event, { messageRepository });

    expect(messageRepository.messages.size).toBe(1);
  });
});
