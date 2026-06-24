export type RedactedLogContext = {
  readonly workspaceIdHash?: string;
  readonly channelIdHash?: string;
  readonly correlationId?: string;
};

export function redactMessageTs(): 'redacted' {
  return 'redacted';
}
