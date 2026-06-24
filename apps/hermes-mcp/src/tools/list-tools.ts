import { allowedHermesTools } from '@replyboard/hermes-harness';

export function listHermesMcpTools(): readonly string[] {
  return allowedHermesTools;
}
