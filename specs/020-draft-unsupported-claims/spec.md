# 020 Draft Unsupported Claims

## Functional Requirements

### FR-DRAFT-002 Unsupported claims require human review

Draft validation must keep generated replies out of ready-to-send state when unsupported claims are
reported.

### AC-DRAFT-002-01 Unsupported claims route to NEEDS_ME

Given:

- A generated draft has one or more unsupported claims after grounding validation.

When:

- Draft readiness is determined.

Then:

- The draft readiness result is `needs_me`.
- The draft is not marked `draft_ready`.

## Security Impact

- Generated replies with facts not supported by retrieved sources cannot be presented as ready to
  send.
- Hallucinated dates, amounts, commitments, or source references require explicit human review.
