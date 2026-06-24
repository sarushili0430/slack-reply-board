import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

import type { MessageRepository, SlackEventId, SyncedSlackMessage } from '@replyboard/slack-sync';

export type SqliteMessageRepositoryOptions = {
  readonly databasePath: string;
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
  readonly payloadJson: string;
};

export class SqliteMessageRepository implements MessageRepository {
  readonly #database: ReturnType<typeof Database>;

  constructor(options: SqliteMessageRepositoryOptions) {
    mkdirSync(dirname(options.databasePath), { recursive: true });

    this.#database = new Database(options.databasePath);
    this.#database.pragma('journal_mode = WAL');
    this.#database.exec(`
      create table if not exists slack_messages (
        event_id text primary key,
        workspace_id text not null,
        channel_id text not null,
        message_ts text not null,
        text text not null,
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
      )
    `);
    this.#database.exec(`
      create table if not exists outbox_events (
        id text primary key,
        event_id text not null unique,
        event_type text not null,
        payload_json text not null,
        created_at text not null default (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
        processed_at text
      )
    `);
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
          payload_json
        ) values (
          @id,
          @eventId,
          @eventType,
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
