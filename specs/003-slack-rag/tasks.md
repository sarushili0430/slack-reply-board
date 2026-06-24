# Tasks

## TASK-RAG-001 Exclude inaccessible Slack chunks

Target spec:

- FR-RAG-001
- AC-RAG-001-01

### Red

- [x] Add `TEST-RAG-UNIT-001`.
- [x] Confirm inaccessible channel chunks are present before filtering.

### Green

- [x] Add permission-aware chunk filtering.

### Refactor

- [x] Keep authorization input explicit and independent from Slack SDK types.

### Verification

- [x] Unit Test
