import { z } from 'zod';

export const boardCardStatusSchema = z.enum([
  'needs_me',
  'drafting',
  'draft_ready',
  'sent',
  'archived',
]);

export const boardCardSummarySchema = z.object({
  id: z.string().min(1),
  status: boardCardStatusSchema,
  channelIdHash: z.string().min(1),
  title: z.string().min(1),
  updatedAt: z.iso.datetime(),
});

export const boardListResponseSchema = z.object({
  cards: z.array(boardCardSummarySchema),
});

export type BoardCardStatusContract = z.infer<typeof boardCardStatusSchema>;
export type BoardCardSummaryContract = z.infer<typeof boardCardSummarySchema>;
export type BoardListResponseContract = z.infer<typeof boardListResponseSchema>;
