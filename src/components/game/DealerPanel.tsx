import { CardDisplay } from './CardDisplay';

interface Props {
  upcard:   string;
  fullHand: string[];
  revealed: boolean;
}

function handValue(cards: string[]): number {
  let total = 0, aces = 0;
  for (const card of cards) {
    const rank = card.slice(0, -1);
    if (rank === 'A') { total += 11; aces++; }
    else if (['J', 'Q', 'K'].includes(rank)) total += 10;
    else total += parseInt(rank, 10) || 0;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

export function DealerPanel({ upcard, fullHand, revealed }: Props) {
  const displayCards = revealed ? fullHand : [upcard];
  const val  = revealed ? handValue(fullHand) : null;
  const bust = val !== null && val > 21;
  const bj   = revealed && fullHand.length === 2 && val === 21;

  return (
    <div
      className="flex flex-col items-center gap-2 md:gap-4 px-4 md:px-10 py-3 md:py-5"
      style={{ borderBottom: '1px solid #2A2A2A' }}
    >
      <span className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px] text-[#848484]">DEALER</span>

      <div className="flex gap-2 md:gap-3 flex-wrap justify-center">
        {displayCards.map((card, i) => (
          <CardDisplay key={`${card}-${i}`} card={card} animDelay={i * 80} small />
        ))}
        {!revealed && (
          <CardDisplay card="?♠" faceDown animDelay={80} small />
        )}
      </div>

      {revealed && val !== null ? (
        <div className="flex items-center gap-1.5 md:gap-2 text-xs md:text-sm">
          <span className="text-[#848484]">Hand:</span>
          <span
            className="font-medium"
            style={{
              color:       bust ? '#f87171' : bj ? '#C9A962' : '#FFFFFF',
              fontFamily:  'Cormorant Garamond, serif',
              fontSize:    'inherit',
            }}
          >{val}{bust ? ' — BUST' : bj ? ' — BJ' : ''}</span>
        </div>
      ) : (
        <span className="text-xs md:text-sm text-[#848484]">
          Showing: <span className="text-white">{upcard}</span>
        </span>
      )}
    </div>
  );
}
