---
name: pr-review
description: Review Slack Reply Board pull request changes for bugs, missing tests, SDD/TDD compliance, architecture boundaries, Electron security, token/log safety, and CI supply-chain policy. Use when Codex is asked for PR review, code review, or pre-merge review in this repo.
---

# PR Review

## Review Priority

Lead with findings. Focus on:

1. Behavioral bugs and regressions.
2. Missing executable tests for changed Acceptance Criteria.
3. Boundary violations and deep imports.
4. Renderer access to Node.js, Electron, Slack, SQLite, or Vector DB.
5. Token, Slack body, Draft body, prompt, or Qwen input leakage.
6. MCP tools that can post to Slack or access DB directly.
7. GitHub Actions `uses:` refs not pinned to full SHAs.
8. Package changes that introduce build scripts without explicit approval.

## Required Checks

Inspect:

- `specs/**`
- `traceability.yaml`
- changed package imports
- `apps/desktop/src/main/**` security flags
- `apps/desktop/src/preload/**` exposed API shape
- `.github/workflows/**`
- `pnpm-workspace.yaml` and `pnpm-lock.yaml`

## Output

Use code-review format:

1. Findings, ordered by severity with file and line references.
2. Open questions or assumptions.
3. Short change summary only after findings.

If there are no findings, say that clearly and mention residual test or release risk.
