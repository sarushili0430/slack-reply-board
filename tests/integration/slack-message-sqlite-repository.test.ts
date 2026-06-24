import Database from 'better-sqlite3';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import { SqliteMessageRepository } from '@replyboard/adapters-sqlite';
import { createSlackEventId, type SyncedSlackMessage } from '@replyboard/slack-sync';

type StoredMessageRow = {
  readonly event_id: string;
  readonly text: string;
};

type OutboxEventRow = {
  readonly event_id: string;
  readonly event_type: string;
  readonly payload_json: string;
};

function createMessage(eventId: string, text: string): SyncedSlackMessage {
  return {
    eventId: createSlackEventId(eventId),
    workspaceId: 'T-integration',
    channelId: 'C-integration',
    messageTs: '1710000000.000500',
    text,
  };
}

describe('FR-SYNC-001 Slack履歴の差分同期', () => {
  test('TEST-SYNC-INTEGRATION-001 / AC-SYNC-001-01: SQLite Raw Message Storeはevent_idを一意に保存する', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'replyboard-sqlite-'));
    const databasePath = join(temporaryDirectory, 'messages.sqlite');
    const repository = new SqliteMessageRepository({ databasePath });

    try {
      await repository.saveMessage(createMessage('Ev-integration-1', 'first body'));
      await repository.saveMessage(createMessage('Ev-integration-1', 'duplicate body'));

      const database = new Database(databasePath, {
        fileMustExist: true,
        readonly: true,
      });

      try {
        const journalMode = database.pragma('journal_mode', { simple: true });
        const rows = database
          .prepare<
            [string],
            StoredMessageRow
          >('select event_id, text from slack_messages where event_id = ?')
          .all('Ev-integration-1');

        expect(journalMode).toBe('wal');
        expect(rows).toEqual([{ event_id: 'Ev-integration-1', text: 'first body' }]);
      } finally {
        database.close();
      }
    } finally {
      repository.close();
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  test('TEST-SYNC-INTEGRATION-002 / NFR-SYNC-003: SQLite Raw Message Storeはindexing outboxを同一保存境界で一度だけ投入する', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'replyboard-sqlite-'));
    const databasePath = join(temporaryDirectory, 'messages.sqlite');
    const repository = new SqliteMessageRepository({ databasePath });

    try {
      await repository.saveMessage(createMessage('Ev-integration-2', 'outbox body'));
      await repository.saveMessage(createMessage('Ev-integration-2', 'duplicate outbox body'));

      const database = new Database(databasePath, {
        fileMustExist: true,
        readonly: true,
      });

      try {
        const rows = database
          .prepare<[string], OutboxEventRow>(
            `
            select event_id, event_type, payload_json
            from outbox_events
            where event_id = ?
          `,
          )
          .all('Ev-integration-2');

        expect(rows).toHaveLength(1);
        expect(rows[0]).toEqual({
          event_id: 'Ev-integration-2',
          event_type: 'slack_message.index_requested',
          payload_json: JSON.stringify({
            eventId: 'Ev-integration-2',
            workspaceId: 'T-integration',
            channelId: 'C-integration',
            messageTs: '1710000000.000500',
          }),
        });
      } finally {
        database.close();
      }
    } finally {
      repository.close();
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
