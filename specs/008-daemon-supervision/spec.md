# 008 Daemon Supervision

## Functional Requirements

### FR-DAEMON-001 Daemon crash supervision

The desktop main process must supervise the separate daemon process and avoid unbounded restart
loops.

### AC-DAEMON-001-01 Maximum restart attempts

Given:

- The daemon process exits unexpectedly.

When:

- The supervisor records daemon exits.

Then:

- The first three unexpected exits request a restart.
- The fourth unexpected exit stops automatic restart.
- An expected shutdown does not request a restart.

## Non-Functional Requirements

### NFR-DAEMON-001 Restart ceiling

The daemon supervisor must restart a crashed daemon at most three times for one crash sequence.
