import type { MessageRepository, SlackEventId, SyncedSlackMessage } from '@replyboard/slack-sync';

export class SqliteMessageRepository implements MessageRepository {
  readonly #messagesByEventId = new Map<SlackEventId, SyncedSlackMessage>();

  hasEventId(eventId: SlackEventId): Promise<boolean> {
    return Promise.resolve(this.#messagesByEventId.has(eventId));
  }

  saveMessage(message: SyncedSlackMessage): Promise<void> {
    this.#messagesByEventId.set(message.eventId, message);
    return Promise.resolve();
  }
}
