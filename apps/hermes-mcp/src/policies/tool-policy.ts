import { isAllowedHermesTool } from '@replyboard/hermes-harness';

export function assertHermesToolAllowed(toolName: string): void {
  if (!isAllowedHermesTool(toolName)) {
    throw new Error(`MCP tool is not allowed: ${toolName}`);
  }
}
