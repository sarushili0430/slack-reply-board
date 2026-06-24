import { z } from 'zod';

export const slackMessageEventSchema = z.object({
  eventId: z.string().min(1),
  workspaceId: z.string().min(1),
  channelId: z.string().min(1),
  messageTs: z.string().min(1),
  threadTs: z.string().min(1).optional(),
  text: z.string(),
  eventTime: z.iso.datetime(),
});

export type SlackMessageEventContract = z.infer<typeof slackMessageEventSchema>;

export const slackMessageDeletionEventSchema = z.object({
  eventId: z.string().min(1),
  workspaceId: z.string().min(1),
  channelId: z.string().min(1),
  messageTs: z.string().min(1),
  eventTime: z.iso.datetime(),
});

export type SlackMessageDeletionEventContract = z.infer<typeof slackMessageDeletionEventSchema>;
