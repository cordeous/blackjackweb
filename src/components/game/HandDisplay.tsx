import { CardDisplay } from './CardDisplay';

interface Props {
  cards:        string[];
  small?:       boolean;
  highlight?:   boolean;
  showValue?:   boolean;
  value?:       number;
  isBust?:      boolean;
  isBlackjack?: boolean;
}

export function HandDisplay({ cards, small = false, highlight = false, showValue = false, value, isBust, isBlackjack }: Props) {
  return (
    <div className="flex flex-col items-center gap-1">
      <div className="flex flex-wrap justify-center gap-1">
        {cards.map((card, i) => (
          <CardDisplay
            key={`${card}-${i}`}
            card={card}
            small={small}
            highlight={highlight}
            animDelay={i * 60}
          />
        ))}
      </div>
      {showValue && value !== undefined && (
        <div
          className="text-xs font-bold px-2 py-0.5 rounded-full select-none"
          style={{
            backgroundColor: isBust ? 'var(--color-loss)' : isBlackjack ? 'var(--color-card-gold)' : 'var(--color-white-a15)',
            color: isBust ? 'var(--color-text-primary)' : isBlackjack ? 'var(--color-page)' : 'var(--color-text-primary)',
          }}
        >
          {isBust ? `${value} BUST` : isBlackjack ? `${value} BJ!` : value}
        </div>
      )}
    </div>
  );
}
