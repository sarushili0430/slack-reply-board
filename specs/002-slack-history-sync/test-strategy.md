# Test Strategy

- Domain and Application tests use in-memory ports.
- Slack adapter contract tests use fixtures, not a real workspace.
- SQLite integration tests must verify unique constraints and outbox behavior.
- Acceptance tests cover externally observable behavior and trace to AC IDs.
