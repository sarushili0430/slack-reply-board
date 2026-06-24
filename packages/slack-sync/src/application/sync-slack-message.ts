import type { SlackMessageEventContract } from '@replyboard/contracts';

import { createSlackEventId } from '../domain/slack-event-id.js';
import type { MessageIndex, MessageRepository } from '../ports/message-repository.js';

export type SyncSlackMessagePorts = {
  readonly messageRepository: MessageRepository;
  readonly keywordIndex: MessageIndex;
  readonly vectorIndex: MessageIndex;
};

export type SyncSlackMessageResult = {
  readonly stored: boolean;
};

export async function syncSlackMessage(
  event: SlackMessageEventContract,
  ports: SyncSlackMessagePorts,
): Promise<SyncSlackMessageResult> {
  const eventId = createSlackEventId(event.eventId);

  if (await ports.messageRepository.hasEventId(eventId)) {
    return { stored: false };
  }

  const message = {
    eventId,
    workspaceId: event.workspaceId,
    channelId: event.channelId,
    messageTs: event.messageTs,
    text: event.text,
  };

  await ports.messageRepository.saveMessage(message);
  await ports.keywordIndex.indexMessage(message);
  await ports.vectorIndex.indexMessage(message);

  return { stored: true };
}
