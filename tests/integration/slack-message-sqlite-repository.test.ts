import Database from 'better-sqlite3';
import { mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, test } from 'vitest';

import {
  migrateSqliteDatabase,
  SqliteMessageRepository,
  SqliteOutboxRepository,
} from '@replyboard/adapters-sqlite';
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

type MarkerRow = {
  readonly id: string;
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

      const storedMessage = await repository.findMessageByEventId('Ev-integration-1');
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
        expect(storedMessage).toEqual(createMessage('Ev-integration-1', 'first body'));
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

  test('TEST-SYNC-INTEGRATION-003 / NFR-SYNC-004: SQLite outboxはat-least-once claimとidempotency keyを提供する', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'replyboard-sqlite-'));
    const databasePath = join(temporaryDirectory, 'messages.sqlite');
    let now = new Date('2026-06-23T10:00:00.000Z');
    const messageRepository = new SqliteMessageRepository({ databasePath });
    const outboxRepository = new SqliteOutboxRepository({
      databasePath,
      lockDurationMs: 60_000,
      now: () => now,
    });

    try {
      await messageRepository.saveMessage(createMessage('Ev-integration-3', 'claim body'));

      const firstClaim = await outboxRepository.claimPendingEvents(10);
      const secondClaim = await outboxRepository.claimPendingEvents(10);

      expect(firstClaim).toEqual([
        {
          id: 'slack-message-index:Ev-integration-3',
          eventId: 'Ev-integration-3',
          eventType: 'slack_message.index_requested',
          idempotencyKey: 'slack-message-index:Ev-integration-3',
          payload: {
            eventId: 'Ev-integration-3',
            workspaceId: 'T-integration',
            channelId: 'C-integration',
            messageTs: '1710000000.000500',
          },
          attemptCount: 1,
        },
      ]);
      expect(secondClaim).toEqual([]);

      now = new Date('2026-06-23T10:01:01.000Z');
      expect(await outboxRepository.claimPendingEvents(10)).toEqual([
        expect.objectContaining({
          id: 'slack-message-index:Ev-integration-3',
          attemptCount: 2,
          idempotencyKey: 'slack-message-index:Ev-integration-3',
        }),
      ]);

      await outboxRepository.markProcessed('slack-message-index:Ev-integration-3');

      expect(await outboxRepository.claimPendingEvents(10)).toEqual([]);
    } finally {
      outboxRepository.close();
      messageRepository.close();
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });

  test('TEST-SYNC-INTEGRATION-004 / NFR-SYNC-005: SQLite migrationは事前snapshotを作り失敗時に旧DBを起動可能に保つ', async () => {
    const temporaryDirectory = await mkdtemp(join(tmpdir(), 'replyboard-sqlite-'));

    try {
      const successfulDatabasePath = join(temporaryDirectory, 'successful.sqlite');
      const snapshotDirectory = join(temporaryDirectory, 'snapshots');
      const successfulDatabase = new Database(successfulDatabasePath);

      try {
        successfulDatabase.exec(`
          create table pre_migration_marker (
            id text primary key
          );
          insert into pre_migration_marker (id) values ('before-success');
          pragma user_version = 0;
        `);
      } finally {
        successfulDatabase.close();
      }

      const migrationResult = migrateSqliteDatabase({
        databasePath: successfulDatabasePath,
        snapshotDirectory,
        now: () => new Date('2026-06-23T10:00:00.000Z'),
        migrations: [
          {
            version: 1,
            name: 'add-post-migration-marker',
            sql: `
              create table post_migration_marker (
                id text primary key
              );
            `,
          },
        ],
      });

      expect(migrationResult.fromVersion).toBe(0);
      expect(migrationResult.toVersion).toBe(1);
      expect(migrationResult.snapshotPath).not.toBeNull();

      if (migrationResult.snapshotPath === null) {
        throw new Error('Expected migration snapshot path');
      }

      const snapshotDatabase = new Database(migrationResult.snapshotPath, {
        fileMustExist: true,
        readonly: true,
      });
      const migratedDatabase = new Database(successfulDatabasePath, {
        fileMustExist: true,
        readonly: true,
      });

      try {
        expect(snapshotDatabase.pragma('user_version', { simple: true })).toBe(0);
        expect(
          snapshotDatabase.prepare<[], MarkerRow>('select id from pre_migration_marker').all(),
        ).toEqual([{ id: 'before-success' }]);
        expect(() =>
          snapshotDatabase.prepare('select id from post_migration_marker').all(),
        ).toThrow(/no such table/);
        expect(migratedDatabase.pragma('user_version', { simple: true })).toBe(1);
        expect(migratedDatabase.prepare('select id from post_migration_marker').all()).toEqual([]);
      } finally {
        snapshotDatabase.close();
        migratedDatabase.close();
      }

      const failedDatabasePath = join(temporaryDirectory, 'failed.sqlite');
      const failedDatabase = new Database(failedDatabasePath);

      try {
        failedDatabase.exec(`
          create table pre_migration_marker (
            id text primary key
          );
          insert into pre_migration_marker (id) values ('before-failure');
          pragma user_version = 0;
        `);
      } finally {
        failedDatabase.close();
      }

      expect(() =>
        migrateSqliteDatabase({
          databasePath: failedDatabasePath,
          snapshotDirectory,
          now: () => new Date('2026-06-23T10:01:00.000Z'),
          migrations: [
            {
              version: 1,
              name: 'partial-marker',
              sql: `
                create table partial_migration_marker (
                  id text primary key
                );
              `,
            },
            {
              version: 2,
              name: 'failing-migration',
              sql: 'create table broken_migration (',
            },
          ],
        }),
      ).toThrow();

      const rolledBackDatabase = new Database(failedDatabasePath, {
        fileMustExist: true,
        readonly: true,
      });

      try {
        expect(rolledBackDatabase.pragma('user_version', { simple: true })).toBe(0);
        expect(
          rolledBackDatabase.prepare<[], MarkerRow>('select id from pre_migration_marker').all(),
        ).toEqual([{ id: 'before-failure' }]);
        expect(() =>
          rolledBackDatabase.prepare('select id from partial_migration_marker').all(),
        ).toThrow(/no such table/);
      } finally {
        rolledBackDatabase.close();
      }
    } finally {
      await rm(temporaryDirectory, { recursive: true, force: true });
    }
  });
});
