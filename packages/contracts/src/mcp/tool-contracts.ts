import { z } from 'zod';

export const mcpToolNameSchema = z.enum([
  'replyboard.search_knowledge',
  'replyboard.get_card',
  'replyboard.propose_draft',
]);

export const mcpToolCallSchema = z.object({
  name: mcpToolNameSchema,
  arguments: z.record(z.string(), z.unknown()),
});

export type McpToolNameContract = z.infer<typeof mcpToolNameSchema>;
export type McpToolCallContract = z.infer<typeof mcpToolCallSchema>;
