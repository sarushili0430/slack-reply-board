---
name: tdd-implementation
description: Implement one Slack Reply Board task through the repository SDD and TDD workflow. Use when Codex is asked to implement a TASK, Requirement ID, Acceptance Criterion, bug fix, domain behavior, adapter contract, or any production change in this repo.
---

# TDD Implementation

## Workflow

1. Read `AGENTS.md`.
2. Read `.specify/memory/constitution.md`.
3. Read the target `specs/*/spec.md`, `plan.md`, `test-strategy.md`, `tasks.md`, and
   `traceability.yaml`.
4. State the target Requirement ID and Acceptance Criterion ID before editing.
5. Add exactly one Red test for the behavior.
6. Run the smallest command that proves Red.
7. Implement the minimum Green production change.
8. Run the same test and then affected package checks.
9. Refactor only while tests stay Green.
10. Update `traceability.yaml` when tests or implementation files change.

## Constraints

- Do not implement multiple tasks in one pass.
- Do not change Acceptance Criteria to fit the implementation.
- Do not skip, delete, or weaken tests.
- Keep Domain free of SDKs, adapters, SQLite, Electron, Qwen, and MCP SDKs.
- Keep Renderer free of Node.js, Electron direct imports, Slack SDKs, and DB clients.
- Instantiate concrete adapters only in `apps/daemon/src/composition-root`.

## Report Format

End with:

- Target Requirement:
- Target Acceptance Criterion:
- Red Test:
- Why it currently fails:
- Minimal Green implementation:
- Refactoring performed:
- Verification commands:
- Remaining risks:
