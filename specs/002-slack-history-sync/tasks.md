# Tasks

## TASK-SYNC-001 重複イベントの排除

Target spec:

- FR-SYNC-001
- AC-SYNC-001-01

### Red

- [x] Add `TEST-SYNC-UNIT-001`.
- [x] Confirm duplicate event storage fails before idempotency exists.

### Green

- [x] Add `SlackEventId` value object.
- [x] Add `MessageRepository` port.
- [x] Make `syncSlackMessage` idempotent by `event_id`.

### Refactor

- [x] Keep Slack SDK types out of Domain and Application.
- [x] Validate external payloads in `@replyboard/contracts`.

### Verification

- [x] Unit Test
- [x] Acceptance Test scaffold
