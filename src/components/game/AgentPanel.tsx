import type { AgentRoundStep } from '../../types/session';
import { AGENT_COLORS, ACTION_BG, ACTION_FG } from '../../types/session';
import { HandDisplay } from './HandDisplay';

interface Props {
  name:             string;
  currentHand:      string[];
  bankroll:         number;
  bet:              number;
  isActive:         boolean;
  activeStep:       AgentRoundStep | null;
  payout:           number | null;
  startingBankroll: number;
}

function handValue(cards: string[]): number {
  let total = 0, aces = 0;
  for (const c of cards) {
    const rank = c.slice(0, -1);
    if (rank === 'A') { total += 11; aces++; }
    else if (['J','Q','K'].includes(rank)) total += 10;
    else total += parseInt(rank, 10) || 0;
  }
  while (total > 21 && aces > 0) { total -= 10; aces--; }
  return total;
}

function isBlackjack(cards: string[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

export function AgentPanel({ name, currentHand, bankroll, bet, isActive, activeStep, payout, startingBankroll }: Props) {
  const color  = AGENT_COLORS[name] ?? 'var(--color-gold)';
  const val    = currentHand.length > 0 ? handValue(currentHand) : null;
  const bust   = val !== null && val > 21;
  const bj     = val !== null && isBlackjack(currentHand);
  const profit = bankroll - startingBankroll;

  const payoutLabel = payout === null
    ? undefined
    : payout > 0
      ? `Win: +$${payout.toFixed(0)}`
      : payout < 0
        ? `Loss: -$${Math.abs(payout).toFixed(0)}`
        : 'Push';

  return (
    <article
      className="flex flex-col overflow-hidden"
      aria-label={`${name}${isActive ? ' — active' : ''}`}
      style={{
        // Active: thick full-color border, brighter background
        // Inactive: dimmed down so the active one reads as focal point
        border:     isActive ? `2px solid ${color}` : '1px solid var(--color-border)',
        background: isActive ? `${color}12` : 'var(--color-page)',
        opacity:    isActive ? 1 : 0.72,
        transition: 'opacity 0.25s ease, border-color 0.25s ease, background 0.25s ease',
        boxShadow:  isActive ? `0 0 0 1px ${color}55, inset 0 0 24px ${color}0a` : 'none',
      }}
    >
      {/* Agent name strip */}
      <div
        className="flex items-center justify-between px-2 md:px-4 py-2 md:py-3 flex-shrink-0"
        style={{ borderBottom: `1px solid ${isActive ? color + '50' : 'var(--color-border-sub)'}` }}
      >
        <div className="flex items-center gap-1.5 md:gap-2 min-w-0">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
          <span
            className="text-[10px] md:text-xs font-semibold truncate"
            style={{ color: isActive ? color : 'var(--color-text-primary)' }}
          >
            {name}
          </span>
        </div>
        <div className="flex flex-col items-end flex-shrink-0">
          <span
            className="text-xs md:text-sm font-medium"
            style={{ fontFamily: 'JetBrains Mono, monospace', color: 'var(--color-gold)' }}
          >${bankroll.toFixed(0)}</span>
          <span
            className="text-[9px] md:text-[10px]"
            style={{ color: profit >= 0 ? 'var(--color-gold)' : 'var(--color-loss-fg)', fontFamily: 'JetBrains Mono, monospace' }}
          >{profit >= 0 ? '+' : ''}{profit.toFixed(0)}</span>
        </div>
      </div>

      {/* Cards */}
      <div className="flex-1 flex flex-col items-center justify-center py-2 md:py-4 px-2 md:px-3 gap-2 md:gap-3 min-h-[90px] md:min-h-[120px]">
        {currentHand.length > 0 ? (
          <HandDisplay
            cards={currentHand}
            small
            highlight={isActive}
            showValue
            value={val ?? 0}
            isBust={bust}
            isBlackjack={bj}
          />
        ) : (
          <span className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-muted)' }}>Waiting…</span>
        )}
        <div className="text-[9px] md:text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>
          Bet <span className="text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>${bet}</span>
        </div>
      </div>

      {/* Decision area */}
      <div
        className="px-2 md:px-4 pb-2 md:pb-4 min-h-[64px] md:min-h-[80px] flex flex-col justify-end gap-1.5"
        aria-live="polite"
        aria-atomic="true"
        aria-label={payoutLabel ?? (activeStep ? `${activeStep.agent_name} chose ${activeStep.action_taken}` : undefined)}
      >
        {payout !== null ? (
          <div
            className="flex items-center justify-center h-9 md:h-10 text-xs md:text-sm font-bold tracking-widest slide-up"
            style={{
              background: payout > 0 ? 'var(--color-win-bg)' : payout < 0 ? 'var(--color-loss-bg)' : 'var(--color-push-bg)',
              border:     `1px solid ${payout > 0 ? 'var(--color-win-fg)' : payout < 0 ? 'var(--color-loss-fg)' : 'var(--color-push-fg)'}`,
              color:      payout > 0 ? 'var(--color-win-fg)' : payout < 0 ? 'var(--color-loss-fg)' : 'var(--color-push-fg)',
            }}
          >
            {payout > 0 ? `+$${payout.toFixed(0)} WIN` : payout < 0 ? `-$${Math.abs(payout).toFixed(0)} LOSS` : 'PUSH'}
          </div>
        ) : activeStep ? (
          <>
            {/* Large action badge — the primary signal of what the agent is doing */}
            <div className="flex justify-center">
              <span
                className="text-xs md:text-sm font-bold uppercase tracking-widest px-3 py-1 slide-up"
                style={{
                  background: ACTION_BG[activeStep.action_taken] ?? 'rgba(255,255,255,0.08)',
                  color:      ACTION_FG[activeStep.action_taken] ?? 'var(--color-text-primary)',
                  border:     `1px solid ${ACTION_FG[activeStep.action_taken] ?? 'var(--color-border)'}`,
                }}
              >
                {activeStep.action_taken}
              </span>
            </div>
            {/* Ghost options row — shows legal alternatives at a smaller size */}
            <div className="flex flex-wrap gap-1 justify-center">
              {activeStep.legal_actions.filter(a => a !== activeStep.action_taken).map(a => (
                <span
                  key={a}
                  className="text-[8px] md:text-[9px] px-1.5 py-0.5 font-medium uppercase tracking-widest"
                  style={{
                    color:  'var(--color-text-muted)',
                    border: '1px solid var(--color-border)',
                  }}
                >{a}</span>
              ))}
            </div>
            {/* Reason text */}
            <p className="text-[9px] md:text-[10px] text-center leading-snug line-clamp-2" style={{ color: 'var(--color-text-secondary)' }}>
              {activeStep.reason}
            </p>
          </>
        ) : (
          <div className="flex justify-center" aria-hidden="true">
            <span className="text-[10px]" style={{ color: 'var(--color-border)' }}>—</span>
          </div>
        )}
      </div>
    </article>
  );
}
