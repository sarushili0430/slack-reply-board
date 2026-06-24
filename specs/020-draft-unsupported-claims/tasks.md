# Tasks

## TASK-DRAFT-002 Route unsupported claims to human review

Target spec:

- FR-DRAFT-002
- AC-DRAFT-002-01

### Red

- [x] Add `TEST-DRAFT-UNIT-002`.
- [x] Confirm draft readiness policy is missing.

### Green

- [x] Add a drafting domain policy that returns `needs_me` when unsupported claims exist.
- [x] Return `draft_ready` only when no unsupported claims are present.

### Refactor

- [x] Keep readiness policy independent from board state transitions.

### Verification

- [x] Unit Test
- [x] Quality
