# Tasks

## TASK-OAUTH-001 Token reference does not expose secrets

Target spec:

- FR-OAUTH-001
- AC-OAUTH-001-01

### Red

- [x] Add `TEST-OAUTH-UNIT-001`.
- [x] Confirm a Renderer-facing token reference would fail if it exposed the Slack token.

### Green

- [x] Add a token reference object containing only `workspaceIdHash` and `keychainAccount`.

### Refactor

- [x] Keep raw Slack token values out of the exported contract.

### Verification

- [x] Unit Test
