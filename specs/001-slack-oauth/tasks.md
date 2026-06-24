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

## TASK-OAUTH-003 Complete OAuth through daemon application boundary

Target spec:

- FR-OAUTH-001
- AC-OAUTH-001-02

### Red

- [x] Add `TEST-OAUTH-UNIT-003`.
- [x] Add `TEST-OAUTH-INTEGRATION-001` and `TEST-OAUTH-INTEGRATION-002`.
- [x] Confirm no application use case stores the OAuth access token through a token store port.

### Green

- [x] Add Runtime Schema for the daemon OAuth completion request and response.
- [x] Add a Slack token store port.
- [x] Add a use case that stores the token and returns only a token reference.
- [x] Add a session-protected daemon local API route for OAuth completion.

### Refactor

- [x] Keep raw token handling inside daemon/application and adapter boundaries.

### Verification

- [x] Unit Test
- [x] Integration Test
- [x] Quality

## TASK-OAUTH-002 OS Keychain token store

Target spec:

- FR-OAUTH-001
- AC-OAUTH-001-01

### Red

- [x] Add `TEST-OAUTH-UNIT-002`.
- [x] Confirm there is no adapter that persists Slack tokens to OS Keychain.

### Green

- [x] Add a Keychain-backed Slack token store.
- [x] Store and retrieve tokens by `TokenReference.keychainAccount`.
- [x] Keep token values out of Renderer-facing token references.

### Refactor

- [x] Keep native keychain details inside `packages/adapters/keychain`.

### Verification

- [x] Unit Test
