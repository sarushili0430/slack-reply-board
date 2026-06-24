# 015 Renderer Posting Guard

## Functional Requirements

### FR-DESKTOP-001 Renderer Slack posting boundary

The Renderer must not be able to post a Slack message by choosing an arbitrary channel or Slack
posting endpoint.

### AC-DESKTOP-001-01 Preload API excludes Slack posting

Given:

- The Electron preload exposes the Renderer-facing API.

When:

- Renderer code inspects and calls the exposed API.

Then:

- No Slack send, post, or channel-targeted method is exposed.
- The API does not accept arbitrary IPC channel names from Renderer.
- The Renderer can only call explicitly allowlisted IPC operations.

## Security Impact

- Slack posting remains behind daemon-side use cases and authorization checks.
- Renderer code cannot select an arbitrary Slack channel or Slack API endpoint.
