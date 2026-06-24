import { describe, expect, test } from 'vitest';

import {
  deleteSlackMessage,
  syncSlackMessage,
  type MessageIndex,
  type MessageRepository,
  type SlackMessageReference,
  type SyncedSlackMessage,
} from '@replyboard/slack-sync';
import { createSlackMessageEvent } from '@replyboard/testkit';
import type { SlackEventId } from '@replyboard/slack-sync';

class AcceptanceMessageRepository implements MessageRepository {
  readonly messages = new Map<SlackEventId, SyncedSlackMessage>();

  hasEventId(eventId: SlackEventId): Promise<boolean> {
    return Promise.resolve(this.messages.has(eventId));
  }

  saveMessage(message: SyncedSlackMessage): Promise<boolean> {
    const inserted = !this.messages.has(message.eventId);
    this.messages.set(message.eventId, message);
    return Promise.resolve(inserted);
  }

  deleteMessage(reference: SlackMessageReference): Promise<boolean> {
    for (const [eventId, message] of this.messages) {
      if (createReferenceKey(message) === createReferenceKey(reference)) {
        this.messages.delete(eventId);
        return Promise.resolve(true);
      }
    }

    return Promise.resolve(false);
  }
}

class AcceptanceMessageIndex implements MessageIndex {
  readonly messages: SyncedSlackMessage[] = [];

  indexMessage(message: SyncedSlackMessage): Promise<void> {
    this.messages.push(message);
    return Promise.resolve();
  }

  deleteMessage(reference: SlackMessageReference): Promise<void> {
    const referenceKey = createReferenceKey(reference);
    const remainingMessages = this.messages.filter(
      (message) => createReferenceKey(message) !== referenceKey,
    );
    this.messages.splice(0, this.messages.length, ...remainingMessages);
    return Promise.resolve();
  }

  search(query: string): readonly SyncedSlackMessage[] {
    return this.messages.filter((message) => message.text.includes(query));
  }
}

function createReferenceKey(reference: SlackMessageReference): string {
  return `${reference.workspaceId}:${reference.channelId}:${reference.messageTs}`;
}

describe('FR-SYNC-001 Slack履歴の差分同期', () => {
  test('TEST-SYNC-ACCEPTANCE-001 / AC-SYNC-001-01: 同じevent_idは一度だけ保存される', async () => {
    const messageRepository = new AcceptanceMessageRepository();
    const keywordIndex = new AcceptanceMessageIndex();
    const vectorIndex = new AcceptanceMessageIndex();
    const event = createSlackMessageEvent({ eventId: 'Ev-acceptance-1' });

    const firstResult = await syncSlackMessage(event, {
      messageRepository,
      keywordIndex,
      vectorIndex,
    });
    const secondResult = await syncSlackMessage(event, {
      messageRepository,
      keywordIndex,
      vectorIndex,
    });

    expect(firstResult.stored).toBe(true);
    expect(secondResult.stored).toBe(false);
    expect(messageRepository.messages.size).toBe(1);
    expect(keywordIndex.messages).toHaveLength(1);
    expect(vectorIndex.messages).toHaveLength(1);
  });

  test('TEST-SYNC-ACCEPTANCE-002 / AC-SYNC-001-03: 削除済みメッセージはVector Index検索結果から消える', async () => {
    const messageRepository = new AcceptanceMessageRepository();
    const keywordIndex = new AcceptanceMessageIndex();
    const vectorIndex = new AcceptanceMessageIndex();
    const event = createSlackMessageEvent({
      eventId: 'Ev-acceptance-2',
      workspaceId: 'T-acceptance',
      channelId: 'C-acceptance',
      messageTs: '1710000000.000700',
      text: 'Vectorから削除されるメッセージ',
    });

    await syncSlackMessage(event, {
      messageRepository,
      keywordIndex,
      vectorIndex,
    });

    expect(vectorIndex.search('削除される')).toHaveLength(1);

    const result = await deleteSlackMessage(
      {
        eventId: 'Ev-acceptance-delete-2',
        workspaceId: event.workspaceId,
        channelId: event.channelId,
        messageTs: event.messageTs,
        eventTime: '2026-06-23T10:05:00.000Z',
      },
      {
        messageRepository,
        keywordIndex,
        vectorIndex,
      },
    );

    expect(result.deleted).toBe(true);
    expect(messageRepository.messages.size).toBe(0);
    expect(vectorIndex.search('削除される')).toEqual([]);
  });
});
