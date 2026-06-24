# Tasks

## TASK-DESKTOP-002 Configurable notification body privacy

Target spec:

- FR-DESKTOP-002
- AC-DESKTOP-002-01
- AC-DESKTOP-002-02

### Red

- [x] Add `TEST-DESKTOP-UNIT-002`.
- [x] Confirm notification content generation fails before a privacy policy exists.

### Green

- [x] Add a notification content policy.
- [x] Hide Slack body text by default.
- [x] Include Slack body text only when user settings explicitly enable previews.

### Refactor

- [x] Keep notification privacy logic independent from Electron Notification primitives.

### Verification

- [x] Unit Test
- [x] Typecheck
