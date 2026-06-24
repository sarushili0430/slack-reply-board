import { describe, expect, test } from 'vitest';

import {
  syncSlackMessage,
  type MessageRepository,
  type SyncedSlackMessage,
} from '@replyboard/slack-sync';
import { createSlackMessageEvent } from '@replyboard/testkit';
import type { SlackEventId } from '@replyboard/slack-sync';

class AcceptanceMessageRepository implements MessageRepository {
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
  test('TEST-SYNC-ACCEPTANCE-001 / AC-SYNC-001-01: 同じevent_idは一度だけ保存される', async () => {
    const messageRepository = new AcceptanceMessageRepository();
    const event = createSlackMessageEvent({ eventId: 'Ev-acceptance-1' });

    const firstResult = await syncSlackMessage(event, { messageRepository });
    const secondResult = await syncSlackMessage(event, { messageRepository });

    expect(firstResult.stored).toBe(true);
    expect(secondResult.stored).toBe(false);
    expect(messageRepository.messages.size).toBe(1);
  });
});
