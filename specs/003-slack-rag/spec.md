# 003 Slack RAG

## Functional Requirements

### FR-RAG-001 Permission-aware retrieval

The system must retrieve only Slack chunks the user is allowed to access.

### AC-RAG-001-01 Forbidden channels are excluded

Given:

- A user has lost access to a channel.

When:

- The user searches for content that exists in that channel.

Then:

- Results from the inaccessible channel are not returned.
