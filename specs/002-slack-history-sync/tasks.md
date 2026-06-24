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

## TASK-SYNC-002 新規メッセージのIndex反映

Target spec:

- FR-SYNC-001
- AC-SYNC-001-02

### Red

- [x] Add `TEST-SYNC-UNIT-002`.
- [x] Confirm a new message is not sent to Keyword and Vector index ports.

### Green

- [x] Add Keyword Index and Vector Index ports.
- [x] Invoke both index ports after Raw Message Store save.

### Refactor

- [x] Keep concrete indexing adapters outside Application.

### Verification

- [x] Unit Test

## TASK-SYNC-003 Slack Event Callback契約変換

Target spec:

- FR-SYNC-001
- AC-SYNC-001-01

### Red

- [x] Add `TEST-SYNC-CONTRACT-001`.
- [x] Confirm raw Slack `event_callback` payload is not converted before adapter mapping exists.

### Green

- [x] Validate raw Slack `event_callback` payload with Runtime Schema.
- [x] Map Slack `event_id`, `team_id`, `channel`, `ts`, `thread_ts`, `text`, and `event_time` to the internal Message Event Contract.
- [x] Reject payloads missing required Slack identifiers.

### Refactor

- [x] Keep Slack raw payload shape inside the Slack adapter.

### Verification

- [x] Contract Test

## TASK-SYNC-004 SQLite Raw Message Store一意制約

Target spec:

- FR-SYNC-001
- AC-SYNC-001-01

### Red

- [x] Add `TEST-SYNC-INTEGRATION-001`.
- [x] Confirm duplicate `event_id` persistence fails before SQLite storage exists.

### Green

- [x] Create the Slack message table in SQLite.
- [x] Enable WAL mode for the database connection.
- [x] Persist messages with a unique `event_id`.
- [x] Preserve the first stored row when the same event is saved twice.

### Refactor

- [x] Keep SQLite schema details inside the adapter package.

### Verification

- [x] SQLite Integration Test

## TASK-SYNC-005 Atomic duplicate indexing guard

Target spec:

- FR-SYNC-001
- AC-SYNC-001-01

### Red

- [x] Add `TEST-SYNC-UNIT-003`.
- [x] Confirm indexing still happens when the Raw Store reports duplicate insertion.

### Green

- [x] Make `MessageRepository.saveMessage` report whether the row was inserted.
- [x] Stop Keyword and Vector indexing when storage reports a duplicate.
- [x] Return `{ stored: false }` for duplicate insertion races.

### Refactor

- [x] Keep idempotency decision at the Raw Store boundary.

### Verification

- [x] Unit Test
- [x] SQLite Integration Test

## TASK-SYNC-006 SQLite indexing outbox

Target spec:

- FR-SYNC-001
- AC-SYNC-001-02
- NFR-SYNC-003

### Red

- [x] Add `TEST-SYNC-INTEGRATION-002`.
- [x] Confirm SQLite Raw Message Store does not create an indexing outbox entry.

### Green

- [x] Create the SQLite outbox table.
- [x] Insert the Raw Message row and indexing outbox row in one transaction.
- [x] Avoid duplicate outbox rows when the same `event_id` is saved twice.

### Refactor

- [x] Keep outbox schema and payload shape inside the SQLite adapter.

### Verification

- [x] SQLite Integration Test

## TASK-SYNC-007 SQLite outbox claim lifecycle

Target spec:

- FR-SYNC-001
- NFR-SYNC-004

### Red

- [x] Add `TEST-SYNC-INTEGRATION-003`.
- [x] Confirm SQLite outbox has no claim lifecycle repository.

### Green

- [x] Add `SqliteOutboxRepository`.
- [x] Return a stable idempotency key for claimed events.
- [x] Lock claimed events until the claim timeout.
- [x] Mark processed events so they are not claimed again.

### Refactor

- [x] Keep outbox lifecycle storage inside the SQLite adapter.

### Verification

- [x] SQLite Integration Test

## TASK-SYNC-008 Indexer outbox consumer

Target spec:

- FR-SYNC-001
- AC-SYNC-001-02
- NFR-SYNC-004

### Red

- [x] Add `TEST-SYNC-UNIT-004`.
- [x] Confirm indexer-worker has no outbox consumer.

### Green

- [x] Claim pending indexing outbox events.
- [x] Read the Raw Message by Slack `event_id`.
- [x] Send the message to Keyword and Vector indexes with the outbox idempotency key.
- [x] Mark the outbox event processed only after both indexes succeed.

### Refactor

- [x] Keep worker orchestration in `apps/indexer-worker`.
- [x] Keep storage details behind ports.

### Verification

- [x] Unit Test
- [x] SQLite Integration Test

## TASK-SYNC-009 SQLite migration snapshot

Target spec:

- NFR-SYNC-005

### Red

- [x] Add `TEST-SYNC-INTEGRATION-004`.
- [x] Confirm SQLite migrations do not create a pre-migration snapshot or preserve the old schema on
      migration failure.

### Green

- [x] Create a local snapshot before applying schema migrations to an existing database.
- [x] Apply schema migrations inside a transaction and advance `user_version`.
- [x] Roll back failed migrations so the previous database remains openable.

### Refactor

- [x] Keep migration mechanics inside the SQLite adapter.

### Verification

- [x] SQLite Integration Test
