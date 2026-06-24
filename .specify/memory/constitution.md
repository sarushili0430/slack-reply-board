# Slack Reply Board Constitution

## Principles

1. Specification is the source of truth.
2. Tests are the executable specification.
3. Code implements the specification.
4. Bounded contexts own business language and behavior.
5. External technology is isolated behind ports and adapters.
6. Renderer is a UI process and never a data access layer.
7. Security defaults are part of the product, not release hardening.

## Required Development Flow

1. Constitution
2. Feature Spec
3. Clarification
4. Technical Plan
5. Acceptance Criteria
6. Test Strategy
7. Tasks
8. Acceptance Test Red
9. Unit or Contract Red, Green, Refactor
10. All Acceptance Criteria Green
11. Spec consistency check
12. PR Review

## Definition of Ready

- Feature Spec exists.
- Requirement IDs are assigned.
- No unresolved clarification remains.
- Acceptance Criteria use Given, When, Then.
- Non-functional requirements are measurable.
- Permission and security impact is documented.
- Test strategy is defined.
- Target packages and dependency direction are known.
- Tasks are split into Red, Green, Refactor units.

## Definition of Done

- Every Acceptance Criterion has an executable test.
- Unit, Contract, Integration, and Acceptance tests are Green.
- RAG or AI changes pass Eval thresholds when affected.
- Requirement, tests, and implementation are traceable.
- No `skip`, `only`, or unresolved clarification markers remain.
- Single responsibility and dependency direction are preserved.
- ADRs are updated when decisions change.
- Spec and implementation agree.
- CI is Green.
