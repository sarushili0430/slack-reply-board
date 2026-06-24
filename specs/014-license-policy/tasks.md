# Tasks

## TASK-LICENSE-001 Third-party dependency license policy

Target spec:

- FR-LICENSE-001
- AC-LICENSE-001-01

### Red

- [x] Add `TEST-LICENSE-CONTRACT-001`.
- [x] Confirm no license policy script or security workflow job exists.

### Green

- [x] Add an explicit license allowlist checker.
- [x] Exclude workspace `@replyboard/*` packages.
- [x] Wire local script and security workflow job.

### Refactor

- [x] Keep license policy in one script with a small explicit allowlist.

### Verification

- [x] Contract Test
- [x] License Policy
- [x] Quality
