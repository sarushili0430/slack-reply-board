# Tasks

## TASK-EVAL-001 Executable eval validation gates

Target spec:

- FR-EVAL-001
- AC-EVAL-001-01

### Red

- [x] Add `TEST-EVAL-CONTRACT-001`.
- [x] Confirm eval commands still use placeholder behavior and quality/CI do not run eval gates.

### Green

- [x] Validate retrieval eval cases and thresholds from disk.
- [x] Validate classification, drafting, and grounding threshold files.
- [x] Wire `pnpm eval` into `pnpm quality`.
- [x] Add CI jobs for eval retrieval, classification, and grounding.

### Refactor

- [x] Keep eval file validation in scripts without model-dependent behavior.

### Verification

- [x] Contract Test
- [x] Eval
- [x] Quality
