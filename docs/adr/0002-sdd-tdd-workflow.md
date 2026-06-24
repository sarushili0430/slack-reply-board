# ADR-0002 SDD and TDD Workflow

## Status

Accepted

## Context

Slack sync, RAG, draft generation, and Hermes orchestration have high ambiguity and safety risk.
Implementation needs executable traceability from specification to code.

## Decision

Use Spec-Driven Development for direction and Test-Driven Development for implementation. Each
task starts from Requirement and Acceptance Criteria IDs, adds a Red test, implements the minimum
Green code, and then considers Refactor.

## Consequences

- Specs must be updated before implementation changes when behavior changes.
- Traceability is checked in CI.
- AI agents must implement one task at a time rather than broad unreviewed changes.
