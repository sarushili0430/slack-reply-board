import { describe, expect, test } from 'vitest';

import {
  mapSlackEventCallbackToMessageDeletionEvent,
  mapSlackEventCallbackToMessageEvent,
} from './index.js';

describe('FR-SYNC-001 Slack履歴の差分同期', () => {
  test('TEST-SYNC-CONTRACT-001 / AC-SYNC-001-01: Slack event_callback payloadを内部Message Event Contractへ変換する', () => {
    const eventTime = Math.floor(Date.parse('2026-06-23T10:00:00.000Z') / 1000);

    const event = mapSlackEventCallbackToMessageEvent({
      type: 'event_callback',
      event_id: 'Ev-contract-1',
      team_id: 'T-contract',
      event_time: eventTime,
      event: {
        type: 'message',
        channel: 'C-contract',
        ts: '1710000000.000300',
        thread_ts: '1710000000.000100',
        text: '契約テスト用メッセージ',
      },
    });

    expect(event).toEqual({
      eventId: 'Ev-contract-1',
      workspaceId: 'T-contract',
      channelId: 'C-contract',
      messageTs: '1710000000.000300',
      threadTs: '1710000000.000100',
      text: '契約テスト用メッセージ',
      eventTime: '2026-06-23T10:00:00.000Z',
    });
  });

  test('TEST-SYNC-CONTRACT-002 / AC-SYNC-001-01: 必須IDを欠いたSlack payloadは拒否する', () => {
    expect(() =>
      mapSlackEventCallbackToMessageEvent({
        type: 'event_callback',
        event_id: 'Ev-contract-2',
        event_time: 1782208800,
        event: {
          type: 'message',
          channel: 'C-contract',
          ts: '1710000000.000400',
          text: 'team_id missing',
        },
      }),
    ).toThrow();
  });

  test('TEST-SYNC-CONTRACT-003 / AC-SYNC-001-03: Slack message_deleted payloadを内部Deletion Event Contractへ変換する', () => {
    const eventTime = Math.floor(Date.parse('2026-06-23T10:05:00.000Z') / 1000);

    const event = mapSlackEventCallbackToMessageDeletionEvent({
      type: 'event_callback',
      event_id: 'Ev-contract-delete-1',
      team_id: 'T-contract',
      event_time: eventTime,
      event: {
        type: 'message',
        subtype: 'message_deleted',
        channel: 'C-contract',
        deleted_ts: '1710000000.000300',
        previous_message: {
          type: 'message',
          ts: '1710000000.000300',
          text: '削除される本文',
        },
      },
    });

    expect(event).toEqual({
      eventId: 'Ev-contract-delete-1',
      workspaceId: 'T-contract',
      channelId: 'C-contract',
      messageTs: '1710000000.000300',
      eventTime: '2026-06-23T10:05:00.000Z',
    });
  });
});
