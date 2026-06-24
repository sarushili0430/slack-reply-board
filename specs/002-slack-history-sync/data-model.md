# Data Model

## SlackEventId

Opaque Slack event identifier converted to a Domain value object before use.

## SyncedSlackMessage

- `eventId`
- `workspaceId`
- `channelId`
- `messageTs`
- `text`

The SQLite implementation must enforce a unique key on `eventId`.
