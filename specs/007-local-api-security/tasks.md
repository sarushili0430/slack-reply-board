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

## TASK-LOCAL-003 Session-protected daemon health endpoint

Target spec:

- FR-LOCAL-001
- AC-LOCAL-001-02

### Red

- [x] Add `TEST-LOCAL-INTEGRATION-001`.
- [x] Confirm no daemon local API runtime can serve authenticated health checks.

### Green

- [x] Add a daemon local API runtime with `GET /health`.
- [x] Validate health responses through Runtime Schema.
- [x] Reject unauthorized health requests.
- [x] Stop the local API runtime cleanly.

### Refactor

- [x] Keep HTTP wiring in daemon local-api and health payload creation in health code.

### Verification

- [x] Integration Test
- [x] Quality
