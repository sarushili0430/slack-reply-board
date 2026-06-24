import { Buffer } from 'node:buffer';
import { randomBytes as nodeRandomBytes, timingSafeEqual } from 'node:crypto';

import {
  localApiAuthorizationHeaderSchema,
  localApiSessionTokenSchema,
} from '@replyboard/contracts';

export type LocalApiSessionTokenOptions = {
  readonly randomBytes?: (size: number) => Buffer;
};

export type LocalApiAuthorizationInput = {
  readonly authorizationHeader: string | undefined;
  readonly sessionToken: string;
};

const sessionTokenByteLength = 32;
const bearerPrefix = 'Bearer ';

export function createLocalApiSessionToken(options: LocalApiSessionTokenOptions = {}): string {
  const randomBytes = options.randomBytes ?? nodeRandomBytes;
  const token = randomBytes(sessionTokenByteLength).toString('base64url');

  return localApiSessionTokenSchema.parse(token);
}

export function isLocalApiRequestAuthorized(input: LocalApiAuthorizationInput): boolean {
  const sessionToken = localApiSessionTokenSchema.parse(input.sessionToken);
  const authorizationHeader = localApiAuthorizationHeaderSchema.safeParse(
    input.authorizationHeader,
  );

  if (!authorizationHeader.success) {
    return false;
  }

  return tokenEquals(authorizationHeader.data.slice(bearerPrefix.length), sessionToken);
}

function tokenEquals(presentedToken: string, sessionToken: string): boolean {
  const presentedTokenBuffer = Buffer.from(presentedToken);
  const sessionTokenBuffer = Buffer.from(sessionToken);

  if (presentedTokenBuffer.length !== sessionTokenBuffer.length) {
    return false;
  }

  return timingSafeEqual(presentedTokenBuffer, sessionTokenBuffer);
}
