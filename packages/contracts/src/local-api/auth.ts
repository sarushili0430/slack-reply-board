import { z } from 'zod';

export const localApiSessionTokenSchema = z
  .string()
  .regex(/^[A-Za-z0-9_-]{43}$/u, 'Local API session token must be 32 bytes base64url encoded.');

export const localApiAuthorizationHeaderSchema = z
  .string()
  .regex(
    /^Bearer [A-Za-z0-9_-]{43}$/u,
    'Local API authorization header must be a Bearer session token.',
  );

export type LocalApiSessionToken = z.infer<typeof localApiSessionTokenSchema>;
export type LocalApiAuthorizationHeader = z.infer<typeof localApiAuthorizationHeaderSchema>;
