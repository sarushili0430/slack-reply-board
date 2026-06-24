export const cardStatuses = ['needs_me', 'drafting', 'draft_ready', 'sent', 'archived'] as const;

export type CardStatus = (typeof cardStatuses)[number];

export type Card = {
  readonly id: string;
  readonly status: CardStatus;
  readonly threadVersion: number;
};

const allowedTransitions: Record<CardStatus, readonly CardStatus[]> = {
  needs_me: ['drafting', 'archived'],
  drafting: ['needs_me', 'draft_ready', 'archived'],
  draft_ready: ['needs_me', 'sent', 'archived'],
  sent: ['archived'],
  archived: [],
};

export function canTransition(from: CardStatus, to: CardStatus): boolean {
  return allowedTransitions[from].includes(to);
}

export function transitionCard(card: Card, nextStatus: CardStatus): Card {
  if (!canTransition(card.status, nextStatus)) {
    throw new Error(`Invalid card transition: ${card.status} -> ${nextStatus}`);
  }

  return {
    ...card,
    status: nextStatus,
  };
}
