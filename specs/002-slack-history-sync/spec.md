# 002 Slack History Sync

## Functional Requirements

### FR-SYNC-001 Slack履歴の差分同期

The system must reflect Slack messages added, edited, or deleted after the previous sync into the
local store and indexes.

### AC-SYNC-001-01 新規メッセージの冪等保存

Given:

- Initial sync has completed.
- Slack emits a `message` event with an `event_id`.

When:

- The same event is received twice.

Then:

- Raw Message Store saves the message once.
- Duplicate receipt returns a non-stored result.
- Downstream indexing is not invoked twice for the same `event_id`.

### AC-SYNC-001-02 新規メッセージの検索反映

Given:

- Initial sync has completed.
- A new Slack message is posted.

When:

- The message event is received.

Then:

- The message is added to Raw Message Store.
- The message is added to Keyword Index.
- The message is added to Vector Index.
- The message is searchable within 30 seconds at p95.

### AC-SYNC-001-03 削除メッセージのIndex除去

Given:

- Initial sync has completed.
- A Slack message has already been stored and indexed.

When:

- Slack emits a `message_deleted` event for that message.

Then:

- The message is removed from Raw Message Store.
- The message is removed from Keyword Index.
- The message is removed from Vector Index.
- The message no longer appears in local search results.

## Non-Functional Requirements

### NFR-SYNC-001 Event reflection latency

Slack events must be reflected to cards within p95 10 seconds, excluding Slack API outages.

### NFR-SYNC-002 Searchability latency

New messages must become searchable within p95 30 seconds after event receipt.

### NFR-SYNC-003 Atomic raw storage and indexing enqueue

Persisting a new Slack message and enqueueing the indexing job must happen in the same SQLite
transaction or through an outbox table protected by the same write boundary.

### NFR-SYNC-004 At-least-once outbox processing

Outbox events must be claimable with an idempotency key, retried at least once after lock expiry,
and hidden from further claims after successful processing.

### NFR-SYNC-005 Migration snapshot and failure safety

SQLite schema migrations must create a local snapshot before mutating an existing database. If a
migration fails, the database must remain openable by the previous application version and retain
its pre-migration data.

## Security Impact

- Slack tokens must stay behind the Slack adapter and Keychain adapter.
- Slack body text must not be written to normal logs.
- Renderer must not call Slack APIs directly.
