# 004 Reply Board

## Functional Requirements

### FR-BOARD-001 Card state transition

The system must enforce allowed card state transitions.

### AC-BOARD-001-01 Draft ready can be sent

Given:

- A card is in `draft_ready`.

When:

- The user sends the draft.

Then:

- The card becomes `sent`.

### AC-BOARD-001-02 Sent cards cannot return to drafting

Given:

- A card is in `sent`.

When:

- Code attempts to move it to `drafting`.

Then:

- The transition is rejected.
