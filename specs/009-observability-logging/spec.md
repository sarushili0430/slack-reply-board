# 009 Observability Logging

## Functional Requirements

### FR-OBS-001 Sensitive log field redaction

The observability layer must sanitize structured log records before they are written.

### AC-OBS-001-01 Normal logs exclude sensitive content

Given:

- A structured log record contains metadata and sensitive content.

When:

- The record is sanitized for normal logging.

Then:

- Slack text, Draft text, tokens, DM names, file bodies, prompt content, raw Qwen input, and message
  timestamps are redacted.
- Safe operational metadata remains available.

## Security Impact

- Diagnostic mode may add IDs and counts, but must not add message bodies or prompt bodies.
