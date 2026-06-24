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

  saveMessage(message: SyncedSlackMessage): Promise<void> {
    this.#database
      .prepare<InsertMessageParams>(
        `
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
      `,
      )
      .run(message);

    return Promise.resolve();
  }

  close(): void {
    this.#database.close();
  }
}
