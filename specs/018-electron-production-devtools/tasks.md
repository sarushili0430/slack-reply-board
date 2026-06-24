# Tasks

## TASK-ELECTRON-002 Disable production DevTools

Target spec:

- FR-ELECTRON-002
- AC-ELECTRON-002-01

### Red

- [x] Extend `TEST-ELECTRON-UNIT-001`.
- [x] Add `TEST-ELECTRON-UNIT-002`.
- [x] Confirm packaged windows do not close DevTools before implementation.

### Green

- [x] Detect packaged Electron builds.
- [x] Close DevTools when a packaged main window is created.
- [x] Close DevTools again if they are opened in a packaged main window.

### Refactor

- [x] Keep DevTools handling next to other main-window security guards.

### Verification

- [x] Unit Test
- [x] Typecheck
