import type { SlackEventId } from '../domain/slack-event-id.js';

export type SyncedSlackMessage = {
  readonly eventId: SlackEventId;
  readonly workspaceId: string;
  readonly channelId: string;
  readonly messageTs: string;
  readonly text: string;
};

export type MessageRepository = {
  hasEventId(eventId: SlackEventId): Promise<boolean>;
  saveMessage(message: SyncedSlackMessage): Promise<void>;
};

export type MessageIndex = {
  indexMessage(message: SyncedSlackMessage): Promise<void>;
};
