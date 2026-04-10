// ---------------------------------------------------------------------------
// Shared blackjack hand evaluation — single source of truth
// ---------------------------------------------------------------------------

export function handValue(cards: string[]): number {
  let total = 0, aces = 0;
  for (const c of cards) {
    const rank = c.slice(0, -1);
    if (rank === 'A') { total += 11; aces++; }
    else if (['J', 'Q', 'K'].includes(rank)) total += 10;
    else total += parseInt(rank, 10) || 0;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

export function isBlackjack(cards: string[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

// ---------------------------------------------------------------------------
// Card aria-label helper — spells out suit names for screen readers
// ---------------------------------------------------------------------------

const SUIT_NAMES: Record<string, string> = {
  '♠': 'Spades',
  '♥': 'Hearts',
  '♦': 'Diamonds',
  '♣': 'Clubs',
};

const RANK_NAMES: Record<string, string> = {
  A: 'Ace',
  K: 'King',
  Q: 'Queen',
  J: 'Jack',
  '10': '10',
};

export function cardAriaLabel(card: string): string {
  if (!card || card === '?♠') return 'Face-down card';
  const suitSymbols = ['♥', '♦', '♣', '♠'];
  const last = card.slice(-1);
  if (!suitSymbols.includes(last)) return card;
  const rank = card.slice(0, -1);
  const rankName = RANK_NAMES[rank] ?? rank;
  const suitName = SUIT_NAMES[last] ?? last;
  return `${rankName} of ${suitName}`;
}
