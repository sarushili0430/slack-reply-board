---
name: spec-review
description: Review Slack Reply Board SDD artifacts for readiness, traceability, security impact, and testability. Use when Codex is asked to review or prepare specs, acceptance criteria, plans, tasks, traceability.yaml, or Definition of Ready for this repo.
---

# Spec Review

## Review Steps

1. Read `AGENTS.md` and `.specify/memory/constitution.md`.
2. Read the target feature folder under `specs/`.
3. Check that every FR has at least one AC.
4. Check every AC uses Given, When, Then.
5. Check non-functional requirements are measurable.
6. Check security impact covers tokens, logs, permissions, and external communication.
7. Check `tasks.md` is split into Red, Green, Refactor, and Verification.
8. Check `traceability.yaml` maps Requirement, ACs, Tasks, Tests, and implementation paths.
9. Run `pnpm spec:lint` and `pnpm spec:traceability` when dependencies are installed.

## Findings Order

Report issues first, ordered by severity. Include file paths and line numbers where possible. Then
list open questions and only then summarize what is ready.

## Blockers

Block implementation if:

- A `[NEEDS CLARIFICATION]` marker remains.
- Acceptance Criteria are not externally observable.
- Required security impact is missing.
- Traceability does not include tests for ready work.
- A task requires multiple unrelated behavior changes.
