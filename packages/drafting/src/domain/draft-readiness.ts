export const draftReadinessStates = ['needs_me', 'draft_ready'] as const;

export type DraftReadinessState = (typeof draftReadinessStates)[number];

export type DraftReadinessInput = {
  readonly unsupportedClaims: readonly string[];
};

export function determineDraftReadiness(input: DraftReadinessInput): DraftReadinessState {
  if (input.unsupportedClaims.length > 0) {
    return 'needs_me';
  }

  return 'draft_ready';
}
