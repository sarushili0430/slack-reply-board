# 005 Draft Generation

## Functional Requirements

### FR-DRAFT-001 Stale draft prevention

The system must prevent sending drafts generated against stale Slack thread versions.

### AC-DRAFT-001-01 Stale drafts cannot be sent

Given:

- A draft was generated for thread version 3.
- Slack thread version is now 4.

When:

- The user attempts to send the draft.

Then:

- Sending is blocked.
