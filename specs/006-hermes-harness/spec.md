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

### AC-HERMES-001-02 Tool call budget is enforced

Given:

- Hermes is executing a task with a configured maximum tool call count.

When:

- The next tool call would exceed that maximum.

Then:

- The tool call is rejected before execution.
- No MCP tool handler is invoked for the over-budget call.
