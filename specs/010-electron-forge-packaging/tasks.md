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

## TASK-PACKAGE-002 Smoke test packaged macOS app

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-02

### Red

- [x] Add `TEST-PACKAGE-CONTRACT-002`.
- [x] Confirm the contract fails while workflows do not run packaged app smoke.

### Green

- [x] Add a packaged macOS app smoke script.
- [x] Run the smoke after Forge packaging in `package.yml`.
- [x] Run the smoke after Forge packaging in `release.yml`.

### Refactor

- [x] Keep packaged smoke reusable between package and release workflows.

### Verification

- [x] Contract Test
- [x] Packaged App Smoke
- [x] Quality

## TASK-PACKAGE-003 Explicit Forge output directory

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-03

### Red

- [x] Add `TEST-PACKAGE-CONTRACT-003`.
- [x] Confirm package and release workflows do not pass an explicit Forge output directory.

### Green

- [x] Pass `--out=out` to Forge packaging in `package.yml`.
- [x] Pass `--out=out` to Forge packaging in `release.yml`.
- [x] Update release verification to require explicit Forge output.

### Refactor

- [x] Keep package and release output paths aligned with `scripts/smoke-macos-app.mjs`.

### Verification

- [x] Contract Test
- [x] Local Forge Package Smoke
- [x] Quality

## TASK-PACKAGE-004 Pass Forge arguments through pnpm exec

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-04

### Red

- [x] Update `TEST-PACKAGE-CONTRACT-001`.
- [x] Confirm package and release workflows still insert an extra `--` before Forge platform and
      architecture arguments.

### Green

- [x] Use `pnpm exec electron-forge package` from the desktop workspace in `package.yml`.
- [x] Use `pnpm exec electron-forge package` from the desktop workspace in `release.yml`.
- [x] Update release verification to reject the extra `--` before Forge platform and architecture
      arguments.

### Refactor

- [x] Keep package and release Forge invocations aligned.

### Verification

- [x] Contract Test
- [x] Local Forge Package Smoke
- [x] Quality

## TASK-PACKAGE-005 Run Forge from desktop working directory

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-05

### Red

- [x] Add `TEST-PACKAGE-CONTRACT-004`.
- [x] Confirm package and release workflows do not set `working-directory: apps/desktop`.

### Green

- [x] Set `working-directory: apps/desktop` in `package.yml`.
- [x] Set `working-directory: apps/desktop` in `release.yml`.
- [x] Wait for the relative `out` directory inside the packaging step.
- [x] Update release verification to require the desktop working directory.

### Refactor

- [x] Keep root-level smoke, upload, checksum, SBOM, and release paths on `apps/desktop/out`.

### Verification

- [x] Contract Test
- [x] Local Forge Package Smoke
- [x] Quality
