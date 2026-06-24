# 006 Hermes Harness

## Functional Requirements

### FR-HERMES-001 Restricted tool access

Hermes must call only allowlisted MCP tools.

### AC-HERMES-001-01 Slack posting tool is absent

Given:

- Hermes requests the available MCP tool list.

When:

- Tool metadata is returned.

Then:

- No Slack send or post tool is present.
