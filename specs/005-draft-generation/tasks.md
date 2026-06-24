# Tasks

## TASK-DRAFT-001 Block stale draft sending

Target spec:

- FR-DRAFT-001
- AC-DRAFT-001-01

### Red

- [x] Add `TEST-DRAFT-UNIT-001`.
- [x] Confirm a stale draft would be sendable without a thread version check.

### Green

- [x] Compare draft thread version with the latest Slack thread version.

### Refactor

- [x] Keep draft staleness logic in the Drafting domain.

### Verification

- [x] Unit Test
