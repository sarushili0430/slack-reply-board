# Tasks

## TASK-PACKAGE-001 Package Electron desktop through Forge

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-01

### Red

- [x] Add `TEST-PACKAGE-CONTRACT-001`.
- [x] Confirm the contract fails while workflows call `electron-packager` directly.

### Green

- [x] Move CI packaging commands to `pnpm --filter @replyboard/desktop package`.
- [x] Move macOS signing and notarization options into `apps/desktop/forge.config.ts`.
- [x] Update release verification to reject direct `electron-packager` usage.

### Refactor

- [x] Keep workflow verification focused on release invariants and packaging entrypoints.

### Verification

- [x] Contract Test
- [x] Quality
- [x] Local Forge package smoke
