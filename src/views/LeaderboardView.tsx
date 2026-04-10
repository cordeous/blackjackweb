import { useEffect, useRef } from 'react';
import { useSession } from '../context/SessionContext';
import { BankrollChart } from '../components/leaderboard/BankrollChart';
import { AGENT_COLORS } from '../types/session';
import { AppHeader } from '../components/AppHeader';
import type { LeaderboardEntry } from '../types/session';

const MEDALS = ['🥇', '🥈', '🥉'];

function formatName(name: string): string {
  return name.replace(/\(/, ' (');
}

function shortName(name: string): string {
  return name.split('(')[0].trim();
}

function LeaderboardRow({ entry, rank, skipAnimation }: { entry: LeaderboardEntry; rank: number; skipAnimation: boolean }) {
  const color   = AGENT_COLORS[entry.name] ?? 'var(--color-gold)';
  const profit  = entry.net_profit;
  const isFirst = rank === 0;

  return (
    <div
      className={`flex items-center px-3 md:px-5 ${skipAnimation ? 'lb-slide-done' : 'lb-slide'}`}
      style={{
        height:         '52px',
        borderBottom:   '1px solid var(--color-border)',
        background:     isFirst ? 'var(--color-gold-bg)' : 'transparent',
        animationDelay: skipAnimation ? undefined : `${rank * 60}ms`,
      }}
    >
      <div className="w-6 md:w-8 flex-shrink-0">
        <span className="text-xs font-medium font-mono" style={{ color: isFirst ? 'var(--color-gold)' : 'var(--color-text-secondary)' }}>
          {rank + 1}
        </span>
      </div>

      <div className="flex items-center gap-2 md:gap-3 w-32 md:w-56 flex-shrink-0">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} aria-hidden="true" />
        <span className="text-xs font-medium truncate" style={{ color: 'var(--color-text-primary)' }} title={formatName(entry.name)}>
          {formatName(entry.name)}
        </span>
        {rank < 3 && <span className="text-sm hidden sm:inline" aria-hidden="true">{MEDALS[rank]}</span>}
      </div>

      <div className="w-14 md:w-20 flex-shrink-0">
        <span className="text-xs font-medium" style={{ color: isFirst ? 'var(--color-gold)' : 'var(--color-text-primary)' }}>
          {entry.points}
        </span>
      </div>

      <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">
        <span className="text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{entry.wins}</span>
      </div>

      <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>{entry.losses}</span>
      </div>

      <div className="hidden md:block w-20 flex-shrink-0">
        <span className="text-xs" style={{ color: 'var(--color-text-primary)' }}>{(entry.win_rate * 100).toFixed(1)}%</span>
      </div>

      <div className="w-20 md:w-28 flex-shrink-0">
        <span className="text-xs font-medium font-mono" style={{ color: isFirst ? 'var(--color-gold)' : 'var(--color-text-primary)' }}>
          ${entry.final_bankroll.toFixed(0)}
        </span>
      </div>

      <div className="flex-1">
        <span className="text-xs font-medium font-mono" style={{ color: profit >= 0 ? 'var(--color-gold)' : 'var(--color-loss-fg)' }}>
          {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
        </span>
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const { state, dispatch } = useSession();
  const session = state.session!;
  const lb = session.leaderboard;
  const winner = lb[0];
  // Persist skip-animation flag in a module-level variable so navigating away
  // and back correctly skips re-playing the entrance animations.
  const hasAnimatedRef = useRef(false);
  const skipAnimation  = hasAnimatedRef.current;

  useEffect(() => {
    document.title = 'Final Standings — Blackjack AI';
    hasAnimatedRef.current = true;
  }, []);

  const winnerColor = winner ? (AGENT_COLORS[winner.name] ?? 'var(--color-gold)') : 'var(--color-gold)';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-page)' }}>

      <AppHeader
        actions={
          <>
            <button
              onClick={() => dispatch({ type: 'GO_TO_GAME' })}
              aria-label="Back to replay"
              className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs transition cursor-pointer"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >◄ Replay</button>
            <button
              onClick={() => dispatch({ type: 'GO_TO_MENU' })}
              aria-label="Start new game"
              className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs font-medium cursor-pointer"
              style={{ background: 'var(--color-gold)', color: 'var(--color-page)' }}
            >New Game</button>
          </>
        }
      />

      {/* ── Winner hero — announces the result immediately ── */}
      {winner && (
        <div
          className={`flex flex-col items-center py-8 md:py-12 gap-2 md:gap-3 px-4 text-center ${skipAnimation ? '' : 'fade-in'}`}
          style={{ borderBottom: '1px solid var(--color-border)', background: `${winnerColor}07` }}
          aria-label={`Tournament winner: ${formatName(winner.name)}, 1st place`}
        >
          <span className="text-[10px] md:text-xs font-medium tracking-[3px]" style={{ color: 'var(--color-text-secondary)' }}>
            TOURNAMENT COMPLETE · {session.rounds_played} ROUNDS
          </span>
          <div className="text-4xl md:text-5xl" aria-hidden="true">🥇</div>
          <h1
            className="text-4xl md:text-6xl font-medium"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: winnerColor }}
          >
            {formatName(winner.name)}
          </h1>

          {/* Stats — distilled: lead with net profit, secondary stats de-emphasised below */}
          <div className="flex flex-col items-center gap-1 mt-2">
            <span className="text-[10px] tracking-[2px]" style={{ color: 'var(--color-text-secondary)' }}>NET PROFIT</span>
            <span
              className="text-3xl md:text-4xl font-medium font-mono"
              style={{ color: winner.net_profit >= 0 ? winnerColor : 'var(--color-loss-fg)' }}
            >
              {winner.net_profit >= 0 ? '+' : ''}${winner.net_profit.toFixed(0)}
            </span>
          </div>

          {/* Secondary stats — smaller, clearly subordinate */}
          <div className="flex items-center gap-4 md:gap-6 mt-1 text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            <span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{winner.points}</span> pts
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>${winner.final_bankroll.toFixed(0)}</span> final
            </span>
            <span aria-hidden="true">·</span>
            <span>
              <span className="font-medium" style={{ color: 'var(--color-text-primary)' }}>{(winner.win_rate * 100).toFixed(1)}%</span> win rate
            </span>
          </div>
        </div>
      )}

      {/* ── Body: sidebar + main table ── */}
      <div className="flex flex-col md:flex-row flex-1 overflow-auto">

        {/* Sidebar — podium (2nd/3rd) + chart */}
        <aside
          className="flex flex-col gap-3 md:gap-5 px-4 md:px-10 py-5 md:py-8 flex-shrink-0"
          style={{ borderBottom: '1px solid var(--color-border)' }}
          aria-label="Podium and bankroll history"
        >
          <span className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px]" style={{ color: 'var(--color-text-secondary)' }}>
            PODIUM
          </span>

          {/* 2nd and 3rd only — 1st is already in the hero */}
          <div className="flex gap-3 md:flex-col md:gap-4 overflow-x-auto pb-2 md:pb-0">
            {lb.slice(1, 3).map((entry, idx) => {
              const rank   = idx + 1; // 1 = 2nd place, 2 = 3rd
              const profit = entry.net_profit;
              const eColor = AGENT_COLORS[entry.name] ?? 'var(--color-gold)';
              return (
                <div
                  key={entry.name}
                  className={`flex items-center gap-3 md:gap-4 px-3 md:px-5 flex-shrink-0 ${skipAnimation ? 'lb-slide-done' : 'lb-slide'}`}
                  style={{
                    height:         '68px',
                    minWidth:       '200px',
                    border:         '1px solid var(--color-border)',
                    background:     'transparent',
                    animationDelay: skipAnimation ? undefined : `${rank * 100}ms`,
                  }}
                >
                  <span className="text-xl flex-shrink-0" aria-hidden="true">{MEDALS[rank]}</span>
                  <div className="flex flex-col gap-0.5 flex-1 min-w-0">
                    <span
                      className="text-sm font-medium truncate"
                      style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-primary)' }}
                      title={formatName(entry.name)}
                    >{formatName(entry.name)}</span>
                    <span className="text-[9px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
                      {entry.points} pts · {entry.wins}W {entry.losses}L
                    </span>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-xs font-medium" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-secondary)' }}>
                      ${entry.final_bankroll.toFixed(0)}
                    </span>
                    <span className="text-[10px] font-mono" style={{ color: profit >= 0 ? eColor : 'var(--color-loss-fg)' }}>
                      {profit >= 0 ? '+' : ''}${profit.toFixed(0)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bankroll chart with accessible wrapper */}
          <figure className="mt-2 md:mt-4">
            <figcaption className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px] mb-2 md:mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              BANKROLL HISTORY
            </figcaption>
            <BankrollChart session={session} />
          </figure>
        </aside>

        {/* Vertical divider on desktop */}
        <div className="hidden md:block flex-shrink-0" style={{ width: '1px', background: 'var(--color-border)' }} aria-hidden="true" />

        {/* Full results table */}
        <main id="main-content" className="flex flex-col flex-1 px-3 md:px-8 py-5 md:py-8">
          <div className="flex items-center justify-between mb-3 md:mb-5">
            <h2 className="text-xl md:text-2xl font-medium" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-primary)' }}>
              Full Results
            </h2>
          </div>

          <div className="overflow-x-auto">
            <div
              className="flex items-center px-3 md:px-5 text-[9px] md:text-xs flex-shrink-0"
              style={{ height: '38px', borderBottom: '1px solid var(--color-border)', background: 'var(--color-table-header)', minWidth: '340px', color: 'var(--color-text-secondary)' }}
            >
              <div className="w-6 md:w-8 flex-shrink-0">#</div>
              <div className="w-32 md:w-56 flex-shrink-0">AGENT</div>
              <div className="w-14 md:w-20 flex-shrink-0">PTS</div>
              <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">W</div>
              <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">L</div>
              <div className="hidden md:block w-20 flex-shrink-0">WIN%</div>
              <div className="w-20 md:w-28 flex-shrink-0">FINAL $</div>
              <div className="flex-1">NET</div>
            </div>

            <div style={{ border: '1px solid var(--color-border)', borderTop: 'none', minWidth: '340px' }}>
              {lb.map((entry, rank) => (
                <LeaderboardRow key={entry.name} entry={entry} rank={rank} skipAnimation={skipAnimation} />
              ))}
            </div>
          </div>

          {/* Round log */}
          <div className="mt-5 md:mt-8">
            <span className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px] block mb-2 md:mb-3" style={{ color: 'var(--color-text-secondary)' }}>
              LAST {Math.min(15, session.rounds.length)} ROUNDS
            </span>
            <RoundLog session={session} />
          </div>
        </main>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Round log
// ---------------------------------------------------------------------------

function RoundLog({ session }: { session: import('../types/session').SessionResult }) {
  const rounds = session.rounds.slice(-15);
  return (
    <div className="overflow-x-auto" style={{ border: '1px solid var(--color-border)' }}>
      <table className="text-xs" style={{ borderCollapse: 'collapse', minWidth: '320px', width: '100%' }}>
        <thead>
          <tr style={{ background: 'var(--color-table-header)', borderBottom: '1px solid var(--color-border)' }}>
            <th className="text-left px-3 md:px-4 py-2 md:py-3 font-normal text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>Rnd</th>
            <th className="text-left px-3 md:px-4 py-2 md:py-3 font-normal text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>Dealer</th>
            {session.rounds[0]?.agent_results.map(ar => (
              <th key={ar.agent_name} className="text-left px-3 md:px-4 py-2 md:py-3 font-medium text-[10px] md:text-xs" style={{ color: AGENT_COLORS[ar.agent_name] ?? 'var(--color-text-secondary)' }}>
                {shortName(ar.agent_name)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map(round => (
            <tr key={round.round_num} style={{ borderBottom: '1px solid var(--color-border-sub)' }}>
              <td className="px-3 md:px-4 py-2 text-[10px] md:text-xs font-mono" style={{ color: 'var(--color-text-primary)' }}>{round.round_num}</td>
              <td className="px-3 md:px-4 py-2 text-[10px] md:text-xs font-mono" style={{ color: 'var(--color-text-secondary)' }}>
                {round.dealer_hand.join(' ')}
              </td>
              {round.agent_results.map(ar => {
                const p = ar.net_payout;
                return (
                  <td key={ar.agent_name} className="px-3 md:px-4 py-2 font-medium text-[10px] md:text-xs font-mono" style={{
                    color: p > 0 ? 'var(--color-gold)' : p < 0 ? 'var(--color-loss-fg)' : 'var(--color-text-secondary)',
                  }}>
                    {p > 0 ? `+$${p}` : p < 0 ? `-$${Math.abs(p)}` : 'PUSH'}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
