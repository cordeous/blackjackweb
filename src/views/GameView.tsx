import { useEffect, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { useReplay } from '../hooks/useReplay';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { DealerPanel } from '../components/game/DealerPanel';
import { AgentPanel } from '../components/game/AgentPanel';
import { ReplayControls } from '../components/game/ReplayControls';
import type { AgentRoundStep } from '../types/session';

const ACTION_BG: Record<string, string> = {
  hit:    'rgba(22,163,74,0.15)',
  stand:  'rgba(220,38,38,0.15)',
  double: 'rgba(217,119,6,0.15)',
  split:  'rgba(124,58,237,0.15)',
};
const ACTION_FG: Record<string, string> = {
  hit:    '#4ade80',
  stand:  '#f87171',
  double: '#fbbf24',
  split:  '#c4b5fd',
};

function ActionBadge({ action }: { action: string }) {
  return (
    <span
      className="text-[10px] md:text-xs font-bold uppercase px-2 py-0.5 md:px-2.5 md:py-1 tracking-widest flex-shrink-0"
      style={{
        background: ACTION_BG[action] ?? 'rgba(255,255,255,0.08)',
        color:      ACTION_FG[action] ?? '#FFFFFF',
        border:     `1px solid ${ACTION_FG[action] ?? '#FFFFFF'}44`,
      }}
    >{action}</span>
  );
}

export function GameView() {
  const { state, dispatch } = useSession();
  const session = state.session!;

  const [replay, controls] = useReplay(session);

  useAutoPlay(replay.isPlaying && !replay.atEnd, replay.speed, () => {
    controls.next();
  });

  useEffect(() => {
    if (replay.atEnd && !replay.isPlaying) { /* user sees final frame */ }
  }, [replay.atEnd, replay.isPlaying]);

  const { currentEvent } = replay;
  const round = session.rounds[currentEvent.roundIndex];
  const n     = round.agent_results.length;

  const agentHands: string[][] = useMemo(() => {
    return round.agent_results.map((ar, ai) => {
      if (currentEvent.kind === 'round_start') {
        return ar.player_hands[0]?.slice(0, 2) ?? [];
      }
      if (currentEvent.kind === 'agent_step') {
        const activeAi    = currentEvent.agentIndex!;
        const activeStepI = currentEvent.stepIndex!;
        if (ai === activeAi) return [...ar.steps[activeStepI].player_hand];
        const lastStep = ar.steps.length > 0
          ? ar.steps[ar.steps.length - 1].player_hand
          : (ar.player_hands[0]?.slice(0, 2) ?? []);
        const hasGone = session.rounds[currentEvent.roundIndex].agent_results[ai].steps.length > 0;
        if (!hasGone) return ar.player_hands[0]?.slice(0, 2) ?? [];
        return lastStep;
      }
      return ar.player_hands[ar.player_hands.length - 1] ?? [];
    });
  }, [currentEvent, round, session]);

  const activeAgentIdx: number | null =
    currentEvent.kind === 'agent_step' ? (currentEvent.agentIndex ?? null) : null;

  const activeStep: AgentRoundStep | null =
    currentEvent.kind === 'agent_step'
      ? round.agent_results[currentEvent.agentIndex!].steps[currentEvent.stepIndex!]
      : null;

  const showPayouts    = currentEvent.kind === 'round_end';
  const dealerRevealed = currentEvent.kind === 'dealer_reveal' || currentEvent.kind === 'round_end';

  const bankrolls: number[] = round.agent_results.map(ar => {
    if (currentEvent.kind === 'round_end') return ar.bankroll_after;
    const prevRound = session.rounds[currentEvent.roundIndex - 1];
    if (!prevRound) return session.starting_bankroll;
    return prevRound.agent_results[ar.agent_index]?.bankroll_after ?? session.starting_bankroll;
  });

  // Mobile: always 1 or 2 columns; tablet+: more
  const colClass =
    n === 1 ? 'grid-cols-1' :
    n === 2 ? 'grid-cols-2' :
    n === 3 ? 'grid-cols-1 sm:grid-cols-3' :
    n === 4 ? 'grid-cols-2 md:grid-cols-4' :
              'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5';

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A' }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-3 md:px-14 h-12 md:h-[72px] flex-shrink-0"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div
            className="w-7 h-7 md:w-9 md:h-9 flex items-center justify-center text-sm md:text-lg font-semibold flex-shrink-0"
            style={{ border: '1px solid #C9A962', color: '#C9A962', fontFamily: 'Cormorant Garamond, serif' }}
          >♠</div>
          <span className="text-[10px] md:text-sm font-medium tracking-[2px] md:tracking-[3px] text-white hidden sm:block">
            BLACKJACK AI
          </span>
        </div>

        {/* Center — Round + Phase */}
        <div className="flex items-center gap-3 md:gap-6">
          <div className="flex flex-col items-center gap-0">
            <span className="text-[9px] md:text-[10px] font-medium tracking-[1px] md:tracking-[2px] text-[#848484]">ROUND</span>
            <span className="text-base md:text-xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              {round.round_num} / {session.rounds_played}
            </span>
          </div>
          <div className="hidden sm:block" style={{ width: '1px', height: '28px', background: '#2A2A2A' }} />
          <div className="hidden sm:flex flex-col items-center gap-0">
            <span className="text-[9px] md:text-[10px] font-medium tracking-[1px] md:tracking-[2px] text-[#848484]">PHASE</span>
            <span className="text-xs md:text-sm font-medium" style={{ color: '#C9A962' }}>
              {currentEvent.kind.replace(/_/g, ' ')}
            </span>
          </div>
        </div>

        {/* Nav buttons */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <button
            onClick={() => dispatch({ type: 'GO_TO_MENU' })}
            className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs text-[#848484] hover:text-white transition cursor-pointer"
            style={{ border: '1px solid #2A2A2A' }}
          >Menu</button>
          <button
            onClick={() => dispatch({ type: 'GO_TO_LEADERBOARD' })}
            className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs font-medium cursor-pointer"
            style={{ background: '#C9A962', color: '#0A0A0A' }}
          >Results</button>
        </div>
      </header>

      {/* ── Dealer ── */}
      <DealerPanel
        upcard={round.dealer_upcard}
        fullHand={round.dealer_hand}
        revealed={dealerRevealed}
      />

      {/* ── Agent panels grid ── */}
      <div className={`flex-1 grid ${colClass} gap-px`} style={{ background: '#2A2A2A' }}>
        {round.agent_results.map((ar, i) => (
          <AgentPanel
            key={ar.agent_name + i}
            name={ar.agent_name}
            currentHand={agentHands[i] ?? []}
            bankroll={bankrolls[i] ?? session.starting_bankroll}
            bet={ar.bets[0] ?? state.config.base_bet}
            isActive={activeAgentIdx === i}
            activeStep={activeAgentIdx === i ? activeStep : null}
            payout={showPayouts ? ar.net_payout : null}
            startingBankroll={session.starting_bankroll}
          />
        ))}
      </div>

      {/* ── Decision banner (hidden on very small screens, shown sm+) ── */}
      {activeStep && (
        <div
          className="hidden sm:flex items-center gap-2 md:gap-4 px-3 md:px-14 h-10 md:h-14 text-xs md:text-sm slide-up flex-shrink-0"
          style={{ background: '#0A0A0A', borderTop: '1px solid #1A1A1A' }}
        >
          <span className="font-semibold flex-shrink-0" style={{ color: '#C9A962' }}>{activeStep.agent_name}</span>
          <span className="text-[#2A2A2A]">→</span>
          <ActionBadge action={activeStep.action_taken} />
          <span className="text-[#848484] text-[10px] md:text-xs truncate">{activeStep.reason}</span>
          <span className="ml-auto text-[10px] md:text-xs text-[#4A4A4A] flex-shrink-0 hidden md:block">
            Hand: {activeStep.hand_value} · Dealer: {activeStep.dealer_upcard}
          </span>
        </div>
      )}

      {/* ── Replay Controls ── */}
      <ReplayControls
        replay={replay}
        controls={controls}
        onLeaderboard={() => dispatch({ type: 'GO_TO_LEADERBOARD' })}
        onMenu={() => dispatch({ type: 'GO_TO_MENU' })}
      />
    </div>
  );
}
