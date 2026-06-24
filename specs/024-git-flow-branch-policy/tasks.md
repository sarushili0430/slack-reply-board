# Tasks

## TASK-GITFLOW-001 Enforce branch and release tag names

Target spec:

- FR-GITFLOW-001
- AC-GITFLOW-001-01
- AC-GITFLOW-001-02

### Red

- [x] Add `TEST-GITFLOW-CONTRACT-001`.
- [x] Confirm the repository has no executable Git flow ref checker.

### Green

- [x] Add `scripts/check-git-flow-ref.mjs`.
- [x] Add a root `gitflow:check` script.
- [x] Run the check in CI for pull requests and branch pushes.
- [x] Run the check in package and release workflows.

### Refactor

- [x] Keep the branch/tag patterns in one script.
- [x] Keep workflow enforcement free of unpinned third-party actions.

### Verification

- [x] Contract Test
- [x] Quality
