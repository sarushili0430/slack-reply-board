# 013 AI Eval Gates

## Functional Requirements

### FR-EVAL-001 AI quality gates are executable

Retrieval, classification, and grounding eval definitions must be checked by executable scripts before
changes can be merged.

### AC-EVAL-001-01 Eval datasets and thresholds are validated in quality and CI

Given:

- Eval cases and threshold files are committed under `evals/`.

When:

- Local `pnpm quality` or CI runs.

Then:

- Retrieval eval cases are parsed and validated.
- Retrieval, classification, drafting, and grounding thresholds are parsed and validated.
- `pnpm eval` runs all eval checks.
- CI exposes separate eval jobs for retrieval, classification, and grounding.

## Security Impact

- Permission and grounding regressions are rejected before AI features are merged.
- Placeholder eval commands are not accepted as passing quality gates.
