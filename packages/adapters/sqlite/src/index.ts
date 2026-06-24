import Database from 'better-sqlite3';
import { copyFileSync, existsSync, mkdirSync } from 'node:fs';
import { basename, dirname, join } from 'node:path';

import {
  createSlackEventId,
  type MessageDeletionRepository,
  type MessageRepository,
  type SlackEventId,
  type SlackMessageReference,
  type SyncedSlackMessage,
} from '@replyboard/slack-sync';

export type SqliteMessageRepositoryOptions = {
  readonly databasePath: string;
};

export type SqliteOutboxRepositoryOptions = {
  readonly databasePath: string;
  readonly lockDurationMs?: number;
  readonly now?: () => Date;
};

export type SqliteOutboxEvent = {
  readonly id: string;
  readonly eventId: string;
  readonly eventType: string;
  readonly idempotencyKey: string;
  readonly payload: unknown;
  readonly attemptCount: number;
};

export type SqliteMigration = {
  readonly version: number;
  readonly name: string;
  readonly sql: string;
};

export type SqliteMigrationOptions = {
  readonly databasePath: string;
  readonly migrations: readonly SqliteMigration[];
  readonly snapshotDirectory?: string;
  readonly now?: () => Date;
};

export type SqliteMigrationResult = {
  readonly fromVersion: number;
  readonly toVersion: number;
  readonly snapshotPath: string | null;
};

type SqliteDatabase = ReturnType<typeof Database>;

type EventIdRow = {
  readonly event_id: string;
};

type StoredMessageRow = {
  readonly event_id: string;
  readonly workspace_id: string;
  readonly channel_id: string;
  readonly message_ts: string;
  readonly text: string;
};

type InsertMessageParams = {
  readonly eventId: SlackEventId;
  readonly workspaceId: string;
  readonly channelId: string;
  readonly messageTs: string;
  readonly text: string;
};

type DeleteMessageParams = {
  readonly workspaceId: string;
  readonly channelId: string;
  readonly messageTs: string;
};

type InsertOutboxEventParams = {
  readonly id: string;
  readonly eventId: SlackEventId;
  readonly eventType: string;
  readonly idempotencyKey: string;
  readonly payloadJson: string;
};

type OutboxEventRow = {
  readonly id: string;
  readonly event_id: string;
  readonly event_type: string;
  readonly idempotency_key: string;
  readonly payload_json: string;
  readonly attempt_count: number;
};

type ClaimOutboxParams = {
  readonly lockedUntil: string;
  readonly eventId: string;
  readonly now: string;
};

type MarkProcessedParams = {
  readonly id: string;
  readonly processedAt: string;
};

const sqliteSchemaMigrations: readonly SqliteMigration[] = [
  {
    version: 1,
    name: 'initial-slack-message-and-outbox-schema',
    sql: `
      create table if not exists slack_messages (
        event_id text primary key,
        workspace_id text not null,
        channel_id text not null,
        message_ts text not null,
        text text not null,
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      );

      create table if not exists outbox_events (
        id text primary key,
        event_id text not null unique,
        event_type text not null,
        idempotency_key text not null unique,
        payload_json text not null,
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        locked_until text,
        attempt_count integer not null default 0,
        processed_at text
      );
    `,
  },
];

export function migrateSqliteDatabase(options: SqliteMigrationOptions): SqliteMigrationResult {
  const orderedMigrations = orderMigrations(options.migrations);
  mkdirSync(dirname(options.databasePath), { recursive: true });

  const databaseExists = existsSync(options.databasePath);
  const database = new Database(options.databasePath);

  try {
    const fromVersion = getUserVersion(database);
    const pendingMigrations = orderedMigrations.filter(
      (migration) => migration.version > fromVersion,
    );
    const lastMigration = pendingMigrations[pendingMigrations.length - 1];

    if (lastMigration === undefined) {
      return {
        fromVersion,
        toVersion: fromVersion,
        snapshotPath: null,
      };
    }

    const snapshotPath =
      databaseExists && options.databasePath !== ':memory:'
        ? snapshotDatabase({
            database,
            databasePath: options.databasePath,
            fromVersion,
            snapshotDirectory:
              options.snapshotDirectory ?? join(dirname(options.databasePath), 'snapshots'),
            now: options.now ?? (() => new Date()),
          })
        : null;

    applyMigrations(database, pendingMigrations);

    return {
      fromVersion,
      toVersion: lastMigration.version,
      snapshotPath,
    };
  } finally {
    database.close();
  }
}

function openDatabase(databasePath: string): SqliteDatabase {
  mkdirSync(dirname(databasePath), { recursive: true });
  migrateSqliteDatabase({
    databasePath,
    migrations: sqliteSchemaMigrations,
  });

  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  initializeSchema(database);

  return database;
}

function initializeSchema(database: SqliteDatabase): void {
  database.exec(`
    create table if not exists slack_messages (
      event_id text primary key,
      workspace_id text not null,
      channel_id text not null,
      message_ts text not null,
      text text not null,
      created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
    )
  `);
  database.exec(`
    create table if not exists outbox_events (
      id text primary key,
      event_id text not null unique,
      event_type text not null,
      idempotency_key text not null unique,
      payload_json text not null,
      created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
      locked_until text,
      attempt_count integer not null default 0,
      processed_at text
    )
  `);
}

function orderMigrations(migrations: readonly SqliteMigration[]): readonly SqliteMigration[] {
  const orderedMigrations = [...migrations].sort((left, right) => left.version - right.version);
  let previousVersion = 0;

  for (const migration of orderedMigrations) {
    if (!Number.isInteger(migration.version) || migration.version <= 0) {
      throw new Error(`SQLite migration "${migration.name}" must use a positive integer version.`);
    }

    if (migration.version <= previousVersion) {
      throw new Error(
        `SQLite migration version ${String(migration.version)} is duplicated or out of order.`,
      );
    }

    previousVersion = migration.version;
  }

  return orderedMigrations;
}

function getUserVersion(database: SqliteDatabase): number {
  const userVersion: unknown = database.pragma('user_version', { simple: true });

  if (typeof userVersion !== 'number' || !Number.isInteger(userVersion)) {
    throw new Error('SQLite user_version must be an integer.');
  }

  return userVersion;
}

function snapshotDatabase(options: {
  readonly database: SqliteDatabase;
  readonly databasePath: string;
  readonly fromVersion: number;
  readonly snapshotDirectory: string;
  readonly now: () => Date;
}): string {
  mkdirSync(options.snapshotDirectory, { recursive: true });
  options.database.pragma('wal_checkpoint(TRUNCATE)');

  const timestamp = options.now().toISOString().replaceAll(':', '-').replaceAll('.', '-');
  const snapshotPath = join(
    options.snapshotDirectory,
    `${basename(options.databasePath)}.v${String(options.fromVersion)}.${timestamp}.snapshot.sqlite`,
  );

  copyFileSync(options.databasePath, snapshotPath);

  return snapshotPath;
}

function applyMigrations(database: SqliteDatabase, migrations: readonly SqliteMigration[]): void {
  const runInTransaction = database.transaction(() => {
    for (const migration of migrations) {
      database.exec(migration.sql);
      database.pragma(`user_version = ${String(migration.version)}`);
    }
  });

  runInTransaction();
}

export class SqliteMessageRepository implements MessageRepository, MessageDeletionRepository {
  readonly #database: SqliteDatabase;

  constructor(options: SqliteMessageRepositoryOptions) {
    this.#database = openDatabase(options.databasePath);
  }

  hasEventId(eventId: SlackEventId): Promise<boolean> {
    const row = this.#database
      .prepare<
        [SlackEventId],
        EventIdRow
      >('select event_id from slack_messages where event_id = ? limit 1')
      .get(eventId);

    return Promise.resolve(row !== undefined);
  }

  saveMessage(message: SyncedSlackMessage): Promise<boolean> {
    const insertMessage = this.#database.prepare<InsertMessageParams>(`
        insert or ignore into slack_messages (
          event_id,
          workspace_id,
          channel_id,
          message_ts,
          text
        ) values (
          @eventId,
          @workspaceId,
          @channelId,
          @messageTs,
          @text
        )
      `);
    const insertOutboxEvent = this.#database.prepare<InsertOutboxEventParams>(`
        insert into outbox_events (
          id,
          event_id,
          event_type,
          idempotency_key,
          payload_json
        ) values (
          @id,
          @eventId,
          @eventType,
          @idempotencyKey,
          @payloadJson
        )
      `);
    const saveMessage = this.#database.transaction((messageToSave: SyncedSlackMessage) => {
      const result = insertMessage.run(messageToSave);

      if (result.changes === 0) {
        return false;
      }

      insertOutboxEvent.run({
        id: `slack-message-index:${messageToSave.eventId}`,
        eventId: messageToSave.eventId,
        eventType: 'slack_message.index_requested',
        idempotencyKey: `slack-message-index:${messageToSave.eventId}`,
        payloadJson: JSON.stringify({
          eventId: messageToSave.eventId,
          workspaceId: messageToSave.workspaceId,
          channelId: messageToSave.channelId,
          messageTs: messageToSave.messageTs,
        }),
      });

      return true;
    });

    return Promise.resolve(saveMessage(message));
  }

  findMessageByEventId(eventId: string): Promise<SyncedSlackMessage | null> {
    const row = this.#database
      .prepare<[string], StoredMessageRow>(
        `
        select event_id, workspace_id, channel_id, message_ts, text
        from slack_messages
        where event_id = ?
        limit 1
      `,
      )
      .get(eventId);

    if (row === undefined) {
      return Promise.resolve(null);
    }

    return Promise.resolve({
      eventId: createSlackEventId(row.event_id),
      workspaceId: row.workspace_id,
      channelId: row.channel_id,
      messageTs: row.message_ts,
      text: row.text,
    });
  }

  deleteMessage(reference: SlackMessageReference): Promise<boolean> {
    const result = this.#database
      .prepare<DeleteMessageParams>(
        `
        delete from slack_messages
        where workspace_id = @workspaceId
          and channel_id = @channelId
          and message_ts = @messageTs
      `,
      )
      .run(reference);

    return Promise.resolve(result.changes > 0);
  }

  close(): void {
    this.#database.close();
  }
}

export class SqliteOutboxRepository {
  readonly #database: SqliteDatabase;
  readonly #lockDurationMs: number;
  readonly #now: () => Date;

  constructor(options: SqliteOutboxRepositoryOptions) {
    this.#database = openDatabase(options.databasePath);
    this.#lockDurationMs = options.lockDurationMs ?? 30_000;
    this.#now = options.now ?? (() => new Date());
  }

  claimPendingEvents(limit: number): Promise<SqliteOutboxEvent[]> {
    const now = this.#now();
    const nowIso = now.toISOString();
    const lockedUntil = new Date(now.getTime() + this.#lockDurationMs).toISOString();
    const findPendingEvents = this.#database.prepare<[string, number], OutboxEventRow>(`
      select id, event_id, event_type, idempotency_key, payload_json, attempt_count
      from outbox_events
      where processed_at is null
        and (locked_until is null or locked_until <= ?)
      order by created_at asc, id asc
      limit ?
    `);
    const claimEvent = this.#database.prepare<ClaimOutboxParams>(`
      update outbox_events
      set locked_until = @lockedUntil,
          attempt_count = attempt_count + 1
      where id = @eventId
        and processed_at is null
        and (locked_until is null or locked_until <= @now)
    `);
    const claimPendingEvents = this.#database.transaction(() => {
      const rows = findPendingEvents.all(nowIso, limit);
      const claimedEvents: SqliteOutboxEvent[] = [];

      for (const row of rows) {
        const result = claimEvent.run({
          eventId: row.id,
          lockedUntil,
          now: nowIso,
        });

        if (result.changes === 0) {
          continue;
        }

        claimedEvents.push({
          id: row.id,
          eventId: row.event_id,
          eventType: row.event_type,
          idempotencyKey: row.idempotency_key,
          payload: JSON.parse(row.payload_json) as unknown,
          attemptCount: row.attempt_count + 1,
        });
      }

      return claimedEvents;
    });

    return Promise.resolve(claimPendingEvents());
  }

  markProcessed(id: string): Promise<void> {
    this.#database
      .prepare<MarkProcessedParams>(
        `
        update outbox_events
        set processed_at = @processedAt,
            locked_until = null
        where id = @id
      `,
      )
      .run({
        id,
        processedAt: this.#now().toISOString(),
      });

    return Promise.resolve();
  }

  close(): void {
    this.#database.close();
  }
}
