import {
  slackMessageDeletionEventSchema,
  slackMessageEventSchema,
  type SlackMessageDeletionEventContract,
  type SlackMessageEventContract,
} from '@replyboard/contracts';
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

const slackMessageDeletedEventCallbackSchema = z.object({
  type: z.literal('event_callback'),
  event_id: z.string().min(1),
  team_id: z.string().min(1),
  event_time: z.number().int().nonnegative(),
  event: z.object({
    type: z.literal('message'),
    subtype: z.literal('message_deleted'),
    channel: z.string().min(1),
    deleted_ts: z.string().min(1),
  }),
});

export function parseSlackMessageEvent(payload: unknown): SlackMessageEventContract {
  return slackMessageEventSchema.parse(payload);
}

export function parseSlackMessageDeletionEvent(
  payload: unknown,
): SlackMessageDeletionEventContract {
  return slackMessageDeletionEventSchema.parse(payload);
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

export function mapSlackEventCallbackToMessageDeletionEvent(
  payload: unknown,
): SlackMessageDeletionEventContract {
  const parsed = slackMessageDeletedEventCallbackSchema.parse(payload);

  return parseSlackMessageDeletionEvent({
    eventId: parsed.event_id,
    workspaceId: parsed.team_id,
    channelId: parsed.event.channel,
    messageTs: parsed.event.deleted_ts,
    eventTime: new Date(parsed.event_time * 1000).toISOString(),
  });
}
