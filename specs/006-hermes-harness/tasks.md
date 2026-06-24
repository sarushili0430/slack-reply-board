# Tasks

## TASK-HERMES-001 Remove Slack posting from Hermes tools

Target spec:

- FR-HERMES-001
- AC-HERMES-001-01

### Red

- [x] Add `TEST-HERMES-UNIT-001`.
- [x] Confirm Slack posting tools are rejected by policy.

### Green

- [x] Add a Hermes allowlist that excludes Slack send and post tools.

### Refactor

- [x] Keep MCP tool listing behind the Hermes policy package.

### Verification

- [x] Unit Test
