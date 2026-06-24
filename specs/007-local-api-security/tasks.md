# Tasks

## TASK-LOCAL-001 Session token authorization

Target spec:

- FR-LOCAL-001
- AC-LOCAL-001-01

### Red

- [x] Add `TEST-LOCAL-UNIT-001`.
- [x] Confirm daemon local API has no session token authorization helper.

### Green

- [x] Add Runtime Schema for local API session tokens and authorization headers.
- [x] Generate a random session token for daemon local API access.
- [x] Authorize only exact `Bearer` tokens.

### Refactor

- [x] Keep token generation and constant-time comparison in daemon local-api code.

### Verification

- [x] Unit Test
