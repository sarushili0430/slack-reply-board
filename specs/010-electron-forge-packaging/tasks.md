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

## TASK-PACKAGE-004 Pass Forge package arguments directly

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-04

### Red

- [x] Update `TEST-PACKAGE-CONTRACT-001`.
- [x] Confirm package and release workflows still insert an extra `--` before Forge platform and
      architecture arguments.

### Green

- [x] Use the Forge package script from `package.yml`.
- [x] Use the Forge package script from `release.yml`.
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

## TASK-PACKAGE-006 Verify Forge Core package output

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-06

### Red

- [x] Add `TEST-PACKAGE-CONTRACT-005`.
- [x] Confirm the contract fails while no verified Forge Core package script exists.

### Green

- [x] Add `scripts/package-electron-forge.mjs`.
- [x] Invoke Electron Forge through `@electron-forge/core`.
- [x] Validate that at least one `.app` bundle exists under `apps/desktop/out`.
- [x] Support comma-separated release architectures.
- [x] Update package and release workflows to use the script.

### Refactor

- [x] Keep package output validation in the script instead of shell loops in workflows.

### Verification

- [x] Contract Test
- [x] Local Forge Package Smoke
- [x] Quality

## TASK-PACKAGE-007 Isolate Forge packaging Node runtime

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-07

### Red

- [x] Add `TEST-PACKAGE-CONTRACT-006`.
- [x] Confirm package and release workflows do not isolate the Forge packaging runtime.

### Green

- [x] Add a package workflow Node setup step scoped before Forge packaging.
- [x] Add a release workflow Node setup step scoped before Forge packaging.
- [x] Keep install and quality gates on `.node-version`.
- [x] Update release verification to require the compatibility runtime step.

### Refactor

- [x] Keep the compatibility runtime visible and named for later removal.

### Verification

- [x] Contract Test
- [x] Local Forge Package Smoke
- [x] Quality

## TASK-PACKAGE-008 Stabilize packaged app smoke on macOS CI

Target spec:

- FR-PACKAGE-001
- AC-PACKAGE-001-02

### Red

- [x] Update `TEST-PACKAGE-CONTRACT-002`.
- [x] Add `TEST-PACKAGE-UNIT-001`.
- [x] Confirm packaged app smoke still depends on Playwright Electron attach.

### Green

- [x] Launch the packaged `.app` executable as a process.
- [x] Add a package smoke readiness marker after Electron lifecycle startup.
- [x] Use a smoke daemon entrypoint that writes a daemon-started marker.
- [x] Quit the packaged app after readiness during package smoke.

### Refactor

- [x] Keep Renderer behavior coverage in Electron E2E and package smoke coverage at process level.

### Verification

- [x] Contract Test
- [x] Unit Test
- [x] Local Forge Package Smoke
- [x] Lint
- [x] Typecheck
