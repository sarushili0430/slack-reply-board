# Tasks

## TASK-LOCAL-002 Reject non-loopback listen hosts

Target spec:

- FR-LOCAL-002
- AC-LOCAL-002-01

### Red

- [x] Add `TEST-LOCAL-UNIT-002`.
- [x] Confirm local API listen options policy is missing.

### Green

- [x] Add local API listen options creation.
- [x] Reject wildcard and non-loopback hosts.

### Refactor

- [x] Keep listen host validation separate from session token authorization.

### Verification

- [x] Unit Test
- [x] Quality
