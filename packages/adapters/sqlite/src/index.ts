import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import type { MessageRepository, SlackEventId, SyncedSlackMessage } from '@replyboard/slack-sync';

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

type EventIdRow = {
  readonly event_id: string;
};

type InsertMessageParams = {
  readonly eventId: SlackEventId;
  readonly workspaceId: string;
  readonly channelId: string;
  readonly messageTs: string;
  readonly text: string;
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

function openDatabase(databasePath: string): ReturnType<typeof Database> {
  mkdirSync(dirname(databasePath), { recursive: true });

  const database = new Database(databasePath);
  database.pragma('journal_mode = WAL');
  initializeSchema(database);

  return database;
}

function initializeSchema(database: ReturnType<typeof Database>): void {
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

export class SqliteMessageRepository implements MessageRepository {
  readonly #database: ReturnType<typeof Database>;

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

  close(): void {
    this.#database.close();
  }
}

export class SqliteOutboxRepository {
  readonly #database: ReturnType<typeof Database>;
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
