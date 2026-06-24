# Tasks

## TASK-RUNTIME-001 Enforce loopback-only runtime endpoints

Target spec:

- FR-RUNTIME-001
- AC-RUNTIME-001-01
- AC-RUNTIME-001-02

### Red

- [x] Add `TEST-RUNTIME-UNIT-001`.
- [x] Add `TEST-RUNTIME-UNIT-002`.
- [x] Confirm Qwen and Vector Store config factories are missing.

### Green

- [x] Add a Qwen config factory that rejects non-loopback base URLs.
- [x] Add a Vector Store config factory that rejects non-loopback endpoints.

### Refactor

- [x] Keep validation local to each adapter until a third runtime needs the same rule.

### Verification

- [x] Unit Test
- [x] Quality
