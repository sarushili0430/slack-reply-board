# Tasks

## TASK-ELECTRON-001 Main window navigation guard

Target spec:

- FR-ELECTRON-001
- AC-ELECTRON-001-01

### Red

- [x] Add `TEST-ELECTRON-UNIT-001`.
- [x] Confirm the main window does not deny new windows or prevent arbitrary navigation.

### Green

- [x] Deny all `window.open` attempts from the Renderer.
- [x] Prevent navigation outside the packaged file URL or development server origin.
- [x] Keep `nodeIntegration: false`, `contextIsolation: true`, and `sandbox: true`.

### Refactor

- [x] Keep URL allowlist logic local to main window creation.

### Verification

- [x] Unit Test
- [x] Quality
