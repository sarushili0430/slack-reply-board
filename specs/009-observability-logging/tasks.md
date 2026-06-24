# Tasks

## TASK-OBS-001 Structured log redaction

Target spec:

- FR-OBS-001
- AC-OBS-001-01

### Red

- [x] Add `TEST-OBS-UNIT-001`.
- [x] Confirm observability has no structured log redaction helper.

### Green

- [x] Redact sensitive structured log fields by key.
- [x] Preserve safe operational metadata.
- [x] Redact nested sensitive fields recursively.

### Refactor

- [x] Keep redaction policy inside `packages/observability`.

### Verification

- [x] Unit Test
