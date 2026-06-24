import { createHash } from 'node:crypto';

import {
  completeSlackOAuthRequestSchema,
  completeSlackOAuthResponseSchema,
  type CompleteSlackOAuthRequestContract,
  type CompleteSlackOAuthResponseContract,
} from '@replyboard/contracts';

import type { SlackTokenStore } from '../ports/slack-token-store.js';

export type CompleteSlackOAuthInput = CompleteSlackOAuthRequestContract & {
  readonly tokenStore: SlackTokenStore;
};

export async function completeSlackOAuth(
  input: CompleteSlackOAuthInput,
): Promise<CompleteSlackOAuthResponseContract> {
  const request = completeSlackOAuthRequestSchema.parse({
    accessToken: input.accessToken,
    workspaceId: input.workspaceId,
  });
  const workspaceIdHash = hashWorkspaceId(request.workspaceId);
  const tokenReference = completeSlackOAuthResponseSchema.parse({
    workspaceIdHash,
    keychainAccount: `slack-workspace/${workspaceIdHash}`,
  });

  await input.tokenStore.saveToken(tokenReference, request.accessToken);

  return tokenReference;
}

function hashWorkspaceId(workspaceId: string): `sha256:${string}` {
  return `sha256:${createHash('sha256').update(workspaceId).digest('hex')}`;
}
