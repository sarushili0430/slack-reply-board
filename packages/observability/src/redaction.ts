export type RedactedLogContext = {
  readonly workspaceIdHash?: string;
  readonly channelIdHash?: string;
  readonly correlationId?: string;
};

export type StructuredLogPrimitive = string | number | boolean | null;

export type StructuredLogValue =
  | StructuredLogPrimitive
  | readonly StructuredLogValue[]
  | StructuredLogRecord;

export type StructuredLogRecord = {
  readonly [key: string]: StructuredLogValue;
};

const redactedValue = 'redacted';
const sensitiveExactFieldNames = new Set([
  'drafttext',
  'draftbody',
  'dmname',
  'filebody',
  'filetext',
  'fullprompt',
  'messagets',
  'messagetext',
  'prompt',
  'promptbody',
  'prompttext',
  'qweninput',
  'rawqweninput',
  'slackbody',
  'slacktext',
]);

export function redactMessageTs(): 'redacted' {
  return redactedValue;
}

export function redactStructuredLogRecord(record: StructuredLogRecord): StructuredLogRecord {
  const redactedRecord: Record<string, StructuredLogValue> = {};

  for (const [key, value] of Object.entries(record)) {
    redactedRecord[key] = redactStructuredLogValue(key, value);
  }

  return redactedRecord;
}

function redactStructuredLogValue(key: string, value: StructuredLogValue): StructuredLogValue {
  if (isSensitiveFieldName(key)) {
    return redactedValue;
  }

  if (isStructuredLogValueArray(value)) {
    return value.map((entry) => redactStructuredLogValue(key, entry));
  }

  if (isStructuredLogRecord(value)) {
    return redactStructuredLogRecord(value);
  }

  return value;
}

function isSensitiveFieldName(key: string): boolean {
  const normalizedKey = key.toLowerCase();

  return normalizedKey.includes('token') || sensitiveExactFieldNames.has(normalizedKey);
}

function isStructuredLogValueArray(
  value: StructuredLogValue,
): value is readonly StructuredLogValue[] {
  return Array.isArray(value);
}

function isStructuredLogRecord(value: StructuredLogValue): value is StructuredLogRecord {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}
