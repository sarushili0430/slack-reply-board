import { describe, expect, test } from 'vitest';

import { transitionCard, type Card } from './card.js';

describe('FR-BOARD-001 カード状態遷移', () => {
  test('AC-BOARD-001-01: Draft完成カードは送信済みに遷移できる', () => {
    const card: Card = {
      id: 'card-1',
      status: 'draft_ready',
      threadVersion: 3,
    };

    expect(transitionCard(card, 'sent')).toEqual({
      id: 'card-1',
      status: 'sent',
      threadVersion: 3,
    });
  });

  test('AC-BOARD-001-02: 送信済みカードはDraft中へ戻せない', () => {
    const card: Card = {
      id: 'card-1',
      status: 'sent',
      threadVersion: 3,
    };

    expect(() => transitionCard(card, 'drafting')).toThrow('Invalid card transition');
  });
});
