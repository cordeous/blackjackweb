import { useEffect, useMemo } from 'react';
import { useSession } from '../context/SessionContext';
import { useReplay } from '../hooks/useReplay';
import { useAutoPlay } from '../hooks/useAutoPlay';
import { DealerPanel } from '../components/game/DealerPanel';
import { AgentPanel } from '../components/game/AgentPanel';
import { ReplayControls } from '../components/game/ReplayControls';
import { AppHeader } from '../components/AppHeader';
import type { AgentRoundStep } from '../types/session';

/** Maps internal event kind keys to plain-English phase labels. */
const PHASE_LABELS: Record<string, string> = {
  round_start:   'Dealing Cards',
  agent_step:    'Playing',
  dealer_reveal: "Dealer's Turn",
  round_end:     'Results',
};

export function GameView() {
  const { state, dispatch } = useSession();
  const session = state.session!;

  const [replay, controls] = useReplay(session);

  useAutoPlay(replay.isPlaying && !replay.atEnd, replay.speed, () => {
    controls.next();
  });

  const { currentEvent } = replay;
  const round = session.rounds[currentEvent.roundIndex];

  useEffect(() => {
    if (!round) return;
    document.title = `Round ${round.round_num}/${session.rounds_played} — Blackjack AI`;
  }, [round?.round_num, session.rounds_played]);

  // Guard: if the session has no rounds, show a safe fallback
  if (!round) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{ background: 'var(--color-page)' }}
        role="alert"
      >
        <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          No rounds available to display.
        </p>
      </div>
    );
  }

  const n = round.agent_results.length;

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
      ? (round.agent_results[currentEvent.agentIndex!]?.steps[currentEvent.stepIndex!] ?? null)
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

  const phaseLabel = PHASE_LABELS[currentEvent.kind] ?? currentEvent.kind;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-page)' }}>

      <AppHeader
        center={
          <div className="flex items-center gap-3 md:gap-6" aria-live="polite" aria-atomic="true">
            <div className="flex flex-col items-center">
              <span className="text-[9px] md:text-[10px] font-medium tracking-[2px]" style={{ color: 'var(--color-text-secondary)' }}>ROUND</span>
              <span className="text-base md:text-xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
                {round.round_num} / {session.rounds_played}
              </span>
            </div>
            <div className="hidden sm:block" style={{ width: '1px', height: '28px', background: 'var(--color-border)' }} aria-hidden="true" />
            <div className="hidden sm:flex flex-col items-center">
              <span className="text-[9px] md:text-[10px] font-medium tracking-[2px]" style={{ color: 'var(--color-text-secondary)' }}>PHASE</span>
              <span className="text-xs md:text-sm font-medium" style={{ color: 'var(--color-gold)' }}>
                {phaseLabel}
              </span>
            </div>
          </div>
        }
        actions={
          <>
            <button
              onClick={() => dispatch({ type: 'GO_TO_MENU' })}
              aria-label="Back to menu"
              className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs transition cursor-pointer"
              style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
            >Menu</button>
            <button
              onClick={() => dispatch({ type: 'GO_TO_LEADERBOARD' })}
              aria-label="View results"
              className="h-7 md:h-9 px-2 md:px-4 text-[10px] md:text-xs font-medium cursor-pointer"
              style={{ background: 'var(--color-gold)', color: 'var(--color-page)' }}
            >Results</button>
          </>
        }
      />

      {/* ── Dealer ── */}
      <DealerPanel
        upcard={round.dealer_upcard}
        fullHand={round.dealer_hand}
        revealed={dealerRevealed}
      />

      {/* ── Agent panels grid ── */}
      <main id="main-content" className={`flex-1 grid ${colClass} gap-px`} style={{ background: 'var(--color-border)' }}>
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
      </main>

      {/* ── Decision banner — shown sm+, always rendered for aria-live stability ── */}
      <div
        aria-live="polite"
        aria-atomic="true"
        aria-label="Current decision"
        className="hidden sm:flex items-center gap-2 md:gap-4 px-3 md:px-14 flex-shrink-0"
        style={{
          minHeight: '48px',
          background: 'var(--color-page)',
          borderTop: '1px solid var(--color-border-sub)',
        }}
      >
        {activeStep && (
          <>
            <span className="font-semibold text-xs md:text-sm flex-shrink-0" style={{ color: 'var(--color-gold)' }}>
              {activeStep.agent_name}
            </span>
            <span style={{ color: 'var(--color-text-muted)' }} aria-hidden="true">→</span>
            <span className="text-xs md:text-sm truncate flex-1" style={{ color: 'var(--color-text-secondary)' }}>
              {activeStep.reason}
            </span>
            <span className="flex-shrink-0 hidden md:block text-[10px]" style={{ color: 'var(--color-text-muted)' }}>
              Hand: {activeStep.hand_value} · Dealer: {activeStep.dealer_upcard}
            </span>
          </>
        )}
      </div>

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
