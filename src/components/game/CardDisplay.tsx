import { SUIT_COLORS } from '../../types/session';

interface Props {
  card:        string;     // e.g. "A♠", "10♥"
  faceDown?:   boolean;
  small?:      boolean;
  highlight?:  boolean;
  animDelay?:  number;     // ms delay for flip animation
}

function parseCard(card: string): { rank: string; symbol: string } {
  const last = card.slice(-1);
  const suitSymbols = ['♥', '♦', '♣', '♠'];
  if (suitSymbols.includes(last)) {
    return { rank: card.slice(0, -1), symbol: last };
  }
  return { rank: card, symbol: '' };
}

/** CSS cross-hatch SVG used as a card back pattern — works on all platforms. */
const CARD_BACK_SVG = encodeURIComponent(
  `<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8">
    <path d="M0 0L8 8M8 0L0 8" stroke="rgba(255,255,255,0.15)" stroke-width="0.8"/>
  </svg>`
);

export function CardDisplay({ card, faceDown = false, small = false, highlight = false, animDelay = 0 }: Props) {
  const w = small ? 'w-9 h-13' : 'w-14 h-20';
  const textLg = small ? 'text-xs' : 'text-base';
  const textSm = small ? 'text-[9px]' : 'text-xs';

  if (faceDown) {
    return (
      <div
        role="img"
        aria-label="Face-down card"
        className={`${w} rounded-md flex-shrink-0 card-flip`}
        style={{
          background: `url("data:image/svg+xml,${CARD_BACK_SVG}") repeat, linear-gradient(135deg, var(--color-card-back-from) 0%, var(--color-card-back-mid) 50%, var(--color-card-back-to) 100%)`,
          border: '1px solid var(--color-card-back-border)',
          animationDelay: `${animDelay}ms`,
          boxSizing: 'border-box',
        }}
      />
    );
  }

  const { rank, symbol } = parseCard(card);
  const suitColor = SUIT_COLORS[symbol] ?? 'var(--color-suit-black)';
  const isRed = symbol === '♥' || symbol === '♦';

  return (
    <div
      role="img"
      aria-label={`${rank}${symbol}`}
      className={`${w} rounded-md flex-shrink-0 card-flip select-none`}
      style={{
        background: highlight ? 'var(--color-card-highlight)' : 'var(--color-card-face)',
        border: highlight ? '1.5px solid var(--color-card-gold)' : '1px solid var(--color-card-border)',
        boxShadow: highlight
          ? '0 0 0 2px var(--color-gold-dim), 0 2px 6px rgba(0,0,0,0.3)'
          : '0 2px 6px rgba(0,0,0,0.3)',
        animationDelay: `${animDelay}ms`,
        color: suitColor,
        display: 'flex',
        flexDirection: 'column',
        padding: small ? '2px 3px' : '3px 4px',
        position: 'relative',
        boxSizing: 'border-box',
      }}
    >
      {/* Top-left rank + suit */}
      <div style={{ lineHeight: 1 }}>
        <div className={`${textSm} font-bold font-mono leading-none`}>{rank}</div>
        <div className={`${textSm} leading-none`} aria-hidden="true">{symbol}</div>
      </div>
      {/* Center large suit */}
      <div
        className={`absolute inset-0 flex items-center justify-center ${textLg} font-bold`}
        style={{ color: suitColor, opacity: isRed ? 0.8 : 0.7 }}
        aria-hidden="true"
      >
        {symbol}
      </div>
    </div>
  );
}
