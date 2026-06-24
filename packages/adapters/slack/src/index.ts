import { slackMessageEventSchema, type SlackMessageEventContract } from '@replyboard/contracts';

export function parseSlackMessageEvent(payload: unknown): SlackMessageEventContract {
  return slackMessageEventSchema.parse(payload);
}
