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

## TASK-HERMES-002 Enforce tool call budget

Target spec:

- FR-HERMES-001
- AC-HERMES-001-02

### Red

- [x] Add `TEST-HERMES-UNIT-002`.
- [x] Confirm over-budget tool calls are not rejected before budget policy exists.

### Green

- [x] Add a Hermes tool call budget policy.
- [x] Allow calls while the current count is below the maximum.
- [x] Reject calls when the current count is already at the maximum.

### Refactor

- [x] Keep budget policy in `packages/hermes-harness`.

### Verification

- [x] Unit Test
