import type { McpToolNameContract } from '@replyboard/contracts';

export const allowedHermesTools: readonly McpToolNameContract[] = [
  'replyboard.search_knowledge',
  'replyboard.get_card',
  'replyboard.propose_draft',
];

export function isAllowedHermesTool(toolName: string): toolName is McpToolNameContract {
  return allowedHermesTools.includes(toolName as McpToolNameContract);
}
