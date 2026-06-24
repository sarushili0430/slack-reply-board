import { z } from 'zod';

export const slackTokenReferenceSchema = z.object({
  workspaceIdHash: z.string().regex(/^sha256:[a-f0-9]{64}$/u),
  keychainAccount: z.string().min(1),
});

export const completeSlackOAuthRequestSchema = z.object({
  workspaceId: z.string().min(1),
  accessToken: z.string().min(1),
});

export const completeSlackOAuthResponseSchema = slackTokenReferenceSchema;

export type SlackTokenReferenceContract = z.infer<typeof slackTokenReferenceSchema>;
export type CompleteSlackOAuthRequestContract = z.infer<typeof completeSlackOAuthRequestSchema>;
export type CompleteSlackOAuthResponseContract = z.infer<typeof completeSlackOAuthResponseSchema>;
