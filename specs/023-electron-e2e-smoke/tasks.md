# Tasks

## TASK-E2E-001 Add Electron launch smoke coverage

Target spec:

- FR-E2E-001
- AC-E2E-001-01

### Red

- [x] Add `TEST-E2E-ELECTRON-001`.
- [x] Confirm the E2E test fails before the Renderer exposes a stable readiness marker.

### Green

- [x] Add the minimal Renderer readiness marker.
- [x] Run Playwright Electron from the built desktop main entry.
- [x] Add a CI E2E job that builds before running the smoke test.

### Refactor

- [x] Keep the smoke test focused on launch, isolation, and preload API availability.

### Verification

- [x] E2E Test
- [x] Spec Traceability
- [x] Quality
