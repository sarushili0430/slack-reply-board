import type { SlackMessageDeletionEventContract } from '@replyboard/contracts';

import type {
  MessageDeletionIndex,
  MessageDeletionRepository,
  SlackMessageReference,
} from '../ports/message-repository.js';

export type DeleteSlackMessagePorts = {
  readonly messageRepository: MessageDeletionRepository;
  readonly keywordIndex: MessageDeletionIndex;
  readonly vectorIndex: MessageDeletionIndex;
};

export type DeleteSlackMessageResult = {
  readonly deleted: boolean;
};

export async function deleteSlackMessage(
  event: SlackMessageDeletionEventContract,
  ports: DeleteSlackMessagePorts,
): Promise<DeleteSlackMessageResult> {
  const reference: SlackMessageReference = {
    workspaceId: event.workspaceId,
    channelId: event.channelId,
    messageTs: event.messageTs,
  };

  const deleted = await ports.messageRepository.deleteMessage(reference);

  await ports.keywordIndex.deleteMessage(reference);
  await ports.vectorIndex.deleteMessage(reference);

  return { deleted };
}
