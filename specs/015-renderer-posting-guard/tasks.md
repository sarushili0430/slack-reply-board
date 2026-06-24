# Tasks

## TASK-DESKTOP-001 Restrict Renderer preload API

Target spec:

- FR-DESKTOP-001
- AC-DESKTOP-001-01

### Red

- [x] Add `TEST-DESKTOP-UNIT-001`.
- [x] Confirm preload API creation fails before an allowlisted API factory exists.

### Green

- [x] Add a preload API factory with an explicit IPC allowlist.
- [x] Expose only the allowlisted API through Electron `contextBridge`.
- [x] Keep Slack send, post, and channel-targeted methods absent from the Renderer API.

### Refactor

- [x] Keep Electron primitives in preload wiring and outside the pure API factory test.

### Verification

- [x] Unit Test
- [x] Typecheck
