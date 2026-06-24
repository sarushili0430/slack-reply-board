# Tasks

## TASK-RELEASE-001 Generate release SBOM

Target spec:

- FR-RELEASE-001
- AC-RELEASE-001-01

### Red

- [x] Add `TEST-RELEASE-CONTRACT-001`.
- [x] Confirm release workflow and SBOM generator are missing before implementation.

### Green

- [x] Add an SBOM generator script.
- [x] Generate SBOM into `apps/desktop/out` during release.
- [x] Make release verification reject missing SBOM generation.

### Refactor

- [x] Keep SBOM generation in a local script instead of a new GitHub Action.

### Verification

- [x] Contract Test
- [x] Release Verification
