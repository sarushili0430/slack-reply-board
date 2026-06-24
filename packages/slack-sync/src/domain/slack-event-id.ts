export type SlackEventId = string & { readonly __brand: 'SlackEventId' };

export function createSlackEventId(value: string): SlackEventId {
  const trimmed = value.trim();

  if (trimmed.length === 0) {
    throw new Error('Slack event_id must not be empty');
  }

  return trimmed as SlackEventId;
}
