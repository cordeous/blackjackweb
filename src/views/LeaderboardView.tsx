import { useSession } from '../context/SessionContext';
import { BankrollChart } from '../components/leaderboard/BankrollChart';
import { AGENT_COLORS } from '../types/session';
import type { LeaderboardEntry } from '../types/session';

const MEDALS = ['🥇', '🥈', '🥉'];

function LeaderboardRow({ entry, rank }: { entry: LeaderboardEntry; rank: number }) {
  const color  = AGENT_COLORS[entry.name] ?? '#C9A962';
  const profit = entry.net_profit;
  const isFirst = rank === 0;

  return (
    <div
      className="flex items-center px-3 md:px-5 lb-slide"
      style={{
        height:          '52px',
        borderBottom:    '1px solid #2A2A2A',
        background:      isFirst ? 'rgba(201,169,98,0.04)' : 'transparent',
        animationDelay:  `${rank * 60}ms`,
      }}
    >
      {/* Rank */}
      <div className="w-6 md:w-8 flex-shrink-0">
        <span
          className="text-xs font-medium"
          style={{ color: isFirst ? '#C9A962' : '#848484', fontFamily: 'JetBrains Mono, monospace' }}
        >{rank + 1}</span>
      </div>

      {/* Color dot + name */}
      <div className="flex items-center gap-2 md:gap-3 w-28 md:w-52 flex-shrink-0">
        <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: color }} />
        <span className="text-xs font-medium text-white truncate">{entry.name.split('(')[0]}</span>
        {rank < 3 && <span className="text-sm hidden sm:inline">{MEDALS[rank]}</span>}
      </div>

      {/* Points — always visible */}
      <div className="w-14 md:w-20 flex-shrink-0">
        <span
          className="text-xs font-medium"
          style={{ color: isFirst ? '#C9A962' : '#FFFFFF' }}
        >{entry.points}</span>
      </div>

      {/* Wins — hidden on xs */}
      <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">
        <span className="text-xs font-medium text-white">{entry.wins}</span>
      </div>

      {/* Losses — hidden on xs */}
      <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">
        <span className="text-xs text-[#848484]">{entry.losses}</span>
      </div>

      {/* Win Rate — hidden on mobile */}
      <div className="hidden md:block w-20 flex-shrink-0">
        <span className="text-xs text-white">{(entry.win_rate * 100).toFixed(1)}%</span>
      </div>

      {/* Final bankroll */}
      <div className="w-20 md:w-28 flex-shrink-0">
        <span
          className="text-xs font-medium"
          style={{ color: isFirst ? '#C9A962' : '#FFFFFF', fontFamily: 'JetBrains Mono, monospace' }}
        >${entry.final_bankroll.toFixed(0)}</span>
      </div>

      {/* Net profit */}
      <div className="flex-1">
        <span
          className="text-xs font-medium"
          style={{ color: profit >= 0 ? '#C9A962' : '#f87171', fontFamily: 'JetBrains Mono, monospace' }}
        >{profit >= 0 ? '+' : ''}${profit.toFixed(0)}</span>
      </div>
    </div>
  );
}

export function LeaderboardView() {
  const { state, dispatch } = useSession();
  const session = state.session!;
  const lb = session.leaderboard;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A' }}>

      {/* Header */}
      <header
        className="flex items-center justify-between px-3 md:px-14 h-12 md:h-[72px] flex-shrink-0"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center text-sm md:text-lg font-semibold flex-shrink-0"
            style={{ border: '1px solid #C9A962', color: '#C9A962', fontFamily: 'Cormorant Garamond, serif' }}
          >♠</div>
          <span className="text-[10px] md:text-sm font-medium tracking-[2px] md:tracking-[3px] text-white hidden sm:block">BLACKJACK AI</span>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => dispatch({ type: 'GO_TO_GAME' })}
            className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs text-[#848484] hover:text-white transition cursor-pointer"
            style={{ border: '1px solid #2A2A2A' }}
          >◄ Replay</button>
          <button
            onClick={() => dispatch({ type: 'GO_TO_MENU' })}
            className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs font-medium cursor-pointer"
            style={{ background: '#C9A962', color: '#0A0A0A' }}
          >New Game</button>
        </div>
      </header>

      {/* Hero */}
      <div
        className="flex flex-col items-center py-5 md:py-8 gap-1 md:gap-2 px-4 text-center"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        <span className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px] text-[#848484]">TOURNAMENT COMPLETE</span>
        <h1 className="text-3xl md:text-5xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
          Final Standings
        </h1>
        <p className="text-[10px] md:text-sm text-[#4A4A4A]">
          {session.rounds_played} rounds · ${session.starting_bankroll} start · WIN=3 · TIE=1 · BJ+2
        </p>
      </div>

      {/* Body: stacked on mobile, two-column on md+ */}
      <div className="flex flex-col md:flex-row flex-1 overflow-auto">

        {/* Podium — full width on mobile, 320px sidebar on desktop */}
        <aside
          className="flex flex-col gap-3 md:gap-5 px-4 md:px-10 py-5 md:py-8 flex-shrink-0"
          style={{ borderBottom: '1px solid #2A2A2A', borderRight: 'none' }}
        >
          <div className="hidden md:block" style={{ borderRight: '1px solid #2A2A2A', position: 'absolute' }} />
          <span className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px] text-[#848484]">PODIUM</span>

          {/* Podium cards — horizontal scroll on mobile */}
          <div className="flex gap-3 md:flex-col md:gap-5 overflow-x-auto pb-2 md:pb-0">
            {lb.slice(0, 3).map((entry, rank) => {
              const profit = entry.net_profit;
              return (
                <div
                  key={entry.name}
                  className="flex items-center gap-3 md:gap-4 px-3 md:px-5 lb-slide flex-shrink-0"
                  style={{
                    height:          rank === 0 ? '76px' : '68px',
                    minWidth:        '180px',
                    border:          rank === 0 ? '1px solid #C9A962' : '1px solid #2A2A2A',
                    background:      rank === 0 ? 'rgba(201,169,98,0.06)' : 'transparent',
                    animationDelay:  `${rank * 100}ms`,
                  }}
                >
                  <span className="text-xl md:text-2xl flex-shrink-0">{MEDALS[rank]}</span>
                  <div className="flex flex-col gap-0.5 md:gap-1 flex-1 min-w-0">
                    <span
                      className="font-medium truncate"
                      style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: rank === 0 ? '15px' : '13px', color: '#FFFFFF' }}
                    >{entry.name.split('(')[0]}</span>
                    <span className="text-[9px] md:text-xs text-[#848484]">
                      {entry.points} pts · {entry.wins}W {entry.losses}L
                    </span>
                  </div>
                  <div className="flex flex-col items-end flex-shrink-0">
                    <span className="text-[9px] md:text-[10px] tracking-[1px] md:tracking-[2px] text-[#848484]">FINAL</span>
                    <span
                      className="font-medium"
                      style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: rank === 0 ? '16px' : '14px', color: rank === 0 ? '#C9A962' : '#848484' }}
                    >${entry.final_bankroll.toFixed(0)}</span>
                    <span
                      className="text-[10px] md:text-xs"
                      style={{ color: profit >= 0 ? '#C9A962' : '#f87171', fontFamily: 'JetBrains Mono, monospace' }}
                    >{profit >= 0 ? '+' : ''}${profit.toFixed(0)}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Bankroll chart */}
          <div className="mt-2 md:mt-4">
            <span className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px] text-[#848484] block mb-2 md:mb-3">BANKROLL HISTORY</span>
            <BankrollChart session={session} />
          </div>
        </aside>

        {/* Divider */}
        <div className="hidden md:block flex-shrink-0" style={{ width: '1px', background: '#2A2A2A' }} />

        {/* Full table */}
        <main className="flex flex-col flex-1 px-3 md:px-8 py-5 md:py-8">
          <div className="flex items-center justify-between mb-3 md:mb-5">
            <h2 className="text-xl md:text-2xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Full Results
            </h2>
          </div>

          {/* Scrollable table wrapper for mobile */}
          <div className="overflow-x-auto">
            {/* Column headers */}
            <div
              className="flex items-center px-3 md:px-5 text-[9px] md:text-xs text-[#848484] flex-shrink-0"
              style={{ height: '38px', borderBottom: '1px solid #2A2A2A', background: '#0D0D0D', minWidth: '320px' }}
            >
              <div className="w-6 md:w-8 flex-shrink-0">#</div>
              <div className="w-28 md:w-52 flex-shrink-0">AGENT</div>
              <div className="w-14 md:w-20 flex-shrink-0">PTS</div>
              <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">W</div>
              <div className="hidden sm:block w-10 md:w-12 flex-shrink-0">L</div>
              <div className="hidden md:block w-20 flex-shrink-0">WIN%</div>
              <div className="w-20 md:w-28 flex-shrink-0">FINAL $</div>
              <div className="flex-1">NET</div>
            </div>

            {/* Rows */}
            <div style={{ border: '1px solid #2A2A2A', borderTop: 'none', minWidth: '320px' }}>
              {lb.map((entry, rank) => (
                <LeaderboardRow key={entry.name} entry={entry} rank={rank} />
              ))}
            </div>
          </div>

          {/* Round log */}
          <div className="mt-5 md:mt-8">
            <span className="text-[9px] md:text-[11px] font-medium tracking-[2px] md:tracking-[3px] text-[#848484] block mb-2 md:mb-3">
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
    <div className="overflow-x-auto" style={{ border: '1px solid #2A2A2A' }}>
      <table className="text-xs" style={{ borderCollapse: 'collapse', minWidth: '320px', width: '100%' }}>
        <thead>
          <tr style={{ background: '#0D0D0D', borderBottom: '1px solid #2A2A2A' }}>
            <th className="text-left px-3 md:px-4 py-2 md:py-3 text-[#848484] font-normal text-[10px] md:text-xs">Rnd</th>
            <th className="text-left px-3 md:px-4 py-2 md:py-3 text-[#848484] font-normal text-[10px] md:text-xs">Dealer</th>
            {session.rounds[0]?.agent_results.map(ar => (
              <th key={ar.agent_name} className="text-left px-3 md:px-4 py-2 md:py-3 font-medium text-[10px] md:text-xs" style={{ color: AGENT_COLORS[ar.agent_name] ?? '#848484' }}>
                {ar.agent_name.split('(')[0]}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map(round => (
            <tr key={round.round_num} style={{ borderBottom: '1px solid #1A1A1A' }}>
              <td className="px-3 md:px-4 py-2 text-white text-[10px] md:text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{round.round_num}</td>
              <td className="px-3 md:px-4 py-2 text-[#848484] text-[10px] md:text-xs" style={{ fontFamily: 'JetBrains Mono, monospace' }}>{round.dealer_hand.join(' ')}</td>
              {round.agent_results.map(ar => {
                const p = ar.net_payout;
                return (
                  <td key={ar.agent_name} className="px-3 md:px-4 py-2 font-medium text-[10px] md:text-xs" style={{
                    color: p > 0 ? '#C9A962' : p < 0 ? '#f87171' : '#848484',
                    fontFamily: 'JetBrains Mono, monospace',
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
