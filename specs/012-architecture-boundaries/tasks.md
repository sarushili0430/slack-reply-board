# Tasks

## TASK-ARCH-001 dependency-cruiser boundary rules

Target spec:

- FR-ARCH-001
- AC-ARCH-001-01

### Red

- [x] Add `TEST-ARCH-CONTRACT-001`.
- [x] Confirm no dependency-cruiser configuration enforces the required boundaries.

### Green

- [x] Add dependency-cruiser configuration with required boundary rules.
- [x] Wire `architecture:check` to the configuration.
- [x] Keep existing repository imports passing.

### Refactor

- [x] Keep ESLint responsible for source-level import spelling and dependency-cruiser responsible
      for dependency graph rules.

### Verification

- [x] Contract Test
- [x] Architecture Check
- [x] Quality
