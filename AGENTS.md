# Development Rules

This repository is governed by SDD and implemented through TDD. Specification is the source of
truth, tests are executable specification, and production code implements the tested specification.

## Required Workflow

1. Read the relevant `spec.md` before implementation.
2. State the target Requirement ID and Acceptance Criteria ID.
3. Add a failing test before production code.
4. Confirm Red before moving to Green.
5. Do not change Acceptance Criteria to make tests pass.
6. Do not delete, skip, or weaken tests to make checks pass.
7. Implement one task at a time.
8. Consider Refactor after Green.
9. Do not add unrequested abstractions or features.
10. Stop and propose a spec change if spec and code conflict.

Every implementation report must include:

- Target Requirement
- Target Acceptance Criterion
- Red Test
- Why it currently fails
- Minimal Green implementation
- Refactoring performed
- Verification commands
- Remaining risks

## Architecture Boundaries

Dependency direction is fixed:

```text
Domain
  ^
Application / Ports
  ^
Adapters
  ^
Composition Root
  ^
Interface: Electron / MCP / Local API
```

Forbidden dependencies:

- Domain to Slack SDK, SQLite, Electron, Qwen, or adapter packages
- Application to concrete adapters
- Renderer to daemon internals, Node.js APIs, Electron, Slack SDK, SQLite, or Vector DB
- MCP tools to direct DB access
- Adapter to another adapter

Package rules:

- Use public package exports only.
- Do not import `@replyboard/*/src/...`.
- Do not introduce cyclic dependencies.
- Do not create generic `utils`, `helpers`, or `common` dumping grounds.
- Put business concepts in the owning bounded context.
- Generalize only after the same meaning appears in at least two places.
- Convert external API identifiers into Domain value objects before Domain use.
- Validate IPC, MCP, and local API input/output with Runtime Schema.
- Only `apps/daemon/src/composition-root` may instantiate concrete adapters.

## Review Size Guidelines

These are review triggers, not mechanical limits.

| Target               | Review starts | Preferred limit |
| -------------------- | ------------: | --------------: |
| Function             |      40 lines |        80 lines |
| Class                |     200 lines |       350 lines |
| File                 |     300 lines |       500 lines |
| MCP Tool Handler     |      30 lines |        50 lines |
| Electron IPC Handler |      30 lines |        50 lines |

If a change exceeds these guidelines, document the reason in the PR.

## Security Defaults

- Slack tokens stay in OS Keychain and never enter SQLite, Renderer, logs, or prompts.
- Normal logs must not include Slack text, Draft text, tokens, DM names, file text, full prompts, or
  raw Qwen input.
- Electron uses `nodeIntegration: false`, `contextIsolation: true`, and Renderer sandboxing.
- Preload exposes only narrow, typed APIs.
- MCP must not expose Slack posting tools.
- Local model, embedding, and vector services listen only on localhost.
