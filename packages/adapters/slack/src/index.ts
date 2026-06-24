import { slackMessageEventSchema, type SlackMessageEventContract } from '@replyboard/contracts';
import { z } from 'zod';

const slackEventCallbackSchema = z.object({
  type: z.literal('event_callback'),
  event_id: z.string().min(1),
  team_id: z.string().min(1),
  event_time: z.number().int().nonnegative(),
  event: z.object({
    type: z.literal('message'),
    channel: z.string().min(1),
    ts: z.string().min(1),
    thread_ts: z.string().min(1).optional(),
    text: z.string().default(''),
  }),
});

export function parseSlackMessageEvent(payload: unknown): SlackMessageEventContract {
  return slackMessageEventSchema.parse(payload);
}

export function mapSlackEventCallbackToMessageEvent(payload: unknown): SlackMessageEventContract {
  const parsed = slackEventCallbackSchema.parse(payload);
  const event = {
    eventId: parsed.event_id,
    workspaceId: parsed.team_id,
    channelId: parsed.event.channel,
    messageTs: parsed.event.ts,
    text: parsed.event.text,
    eventTime: new Date(parsed.event_time * 1000).toISOString(),
  };

  if (parsed.event.thread_ts === undefined) {
    return parseSlackMessageEvent(event);
  }

  return parseSlackMessageEvent({
    ...event,
    threadTs: parsed.event.thread_ts,
  });
}
