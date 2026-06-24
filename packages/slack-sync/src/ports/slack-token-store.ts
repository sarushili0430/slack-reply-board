import type { SlackTokenReferenceContract } from '@replyboard/contracts';

export type SlackTokenReference = SlackTokenReferenceContract;

export type SlackTokenStore = {
  saveToken(reference: SlackTokenReference, token: string): Promise<void>;
  readToken?(reference: SlackTokenReference): Promise<string | null>;
  deleteToken?(reference: SlackTokenReference): Promise<boolean>;
};
