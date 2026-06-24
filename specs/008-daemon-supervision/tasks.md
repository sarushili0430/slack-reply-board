# Tasks

## TASK-DAEMON-001 Restart policy ceiling

Target spec:

- FR-DAEMON-001
- AC-DAEMON-001-01
- NFR-DAEMON-001

### Red

- [x] Add `TEST-DAEMON-UNIT-001`.
- [x] Confirm desktop has no daemon restart policy.

### Green

- [x] Add a daemon restart policy with a default maximum of three restarts.
- [x] Restart only unexpected daemon exits.
- [x] Stop restarting after the third unexpected exit.

### Refactor

- [x] Keep restart-count policy separate from process-spawn mechanics.

### Verification

- [x] Unit Test
