import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { runSession } from '../api/client';
import { AppHeader } from '../components/AppHeader';
import { AGENT_COLORS } from '../types/session';

// ---------------------------------------------------------------------------
// Agent metadata — personality tags that make selection feel meaningful
// ---------------------------------------------------------------------------

const ALL_AGENTS = [
  {
    id:          'Random',
    label:       'Random',
    tag:         'Chaos',
    desc:        'Selects actions randomly — the baseline every agent must beat',
    personality: 'Unpredictable by design. A reminder that luck alone won\'t cut it.',
  },
  {
    id:          'Heuristic(basic)',
    label:       'Heuristic',
    tag:         'Optimal',
    suffix:      'Basic',
    desc:        'Rule-based basic strategy — statistically optimal play',
    personality: 'The textbook answer. Plays every hand exactly as the math dictates.',
  },
  {
    id:          'Heuristic(aggressive)',
    label:       'Heuristic',
    tag:         'High Variance',
    suffix:      'Aggressive',
    desc:        'Doubles and splits far more often — swings hard in both directions',
    personality: 'Goes for the jugular. Bigger wins, bigger losses, never boring.',
  },
  {
    id:          'MCTS',
    label:       'MCTS',
    tag:         'Analytical',
    desc:        'Monte Carlo Tree Search — runs thousands of simulations per decision',
    personality: 'Thinks ten moves ahead. Computationally expensive. Rarely surprised.',
  },
  {
    id:          'DNN',
    label:       'DNN',
    tag:         'Learned',
    desc:        'Deep Neural Network — trained on millions of hands',
    personality: 'Doesn\'t follow rules. Learned patterns humans never articulated.',
  },
];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

// ---------------------------------------------------------------------------
// Main view
// ---------------------------------------------------------------------------

export function MainMenuView() {
  const { state, dispatch } = useSession();
  const cfg = state.config;
  const [loading, setLoading] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [hoveredAgent, setHoveredAgent] = useState<string | null>(null);

  useEffect(() => {
    document.title = 'Configure Tournament — Blackjack AI';
    // Tiny delay so CSS transitions have something to animate from
    const t = setTimeout(() => setMounted(true), 30);
    return () => clearTimeout(t);
  }, []);

  const isSelected = (id: string) => cfg.agents.includes(id);

  function toggleAgent(id: string) {
    const next = isSelected(id)
      ? cfg.agents.filter(a => a !== id)
      : [...cfg.agents, id];
    dispatch({ type: 'SET_CONFIG', config: { agents: next } });
  }

  function setNum(key: string, val: number) {
    dispatch({ type: 'SET_CONFIG', config: { [key]: val } as any });
  }

  async function handleStart() {
    if (cfg.agents.length === 0 || loading) return;
    setLoading(true);
    dispatch({ type: 'START_LOADING' });
    try {
      const session = await runSession(cfg);
      dispatch({ type: 'SESSION_LOADED', session });
    } catch (err: any) {
      if (err?.name === 'AbortError') return;
      dispatch({ type: 'SESSION_ERROR', error: err.message ?? 'Unknown error occurred' });
      setLoading(false);
    }
  }

  const selectedCount = cfg.agents.length;
  const canRun = selectedCount > 0 && !loading;
  const activeAgent = hoveredAgent
    ? ALL_AGENTS.find(a => a.id === hoveredAgent)
    : ALL_AGENTS.find(a => isSelected(a.id)) ?? null;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-page)' }}>

      <AppHeader />

      {/* ── Error ── */}
      {state.error && (
        <div
          role="alert"
          className="mx-4 md:mx-14 mt-4 px-4 py-3 text-xs slide-up"
          style={{ border: '1px solid var(--color-loss)', background: 'var(--color-error-bg)', color: 'var(--color-loss-fg)' }}
        >⚠ {state.error}</div>
      )}

      {/* ── Main layout: roster left, config right ── */}
      <main
        id="main-content"
        className="flex flex-col lg:flex-row flex-1 pb-[72px]"
      >
        {/* ════════════════════════════════════════
            LEFT — Competitor roster
        ════════════════════════════════════════ */}
        <div className="flex flex-col flex-1 min-w-0 pt-8 md:pt-12 pb-4">

          {/* Page title — editorial, left-aligned, no hero zone */}
          <div className="px-6 md:px-14 mb-8 md:mb-10">
            <p
              className="text-[10px] font-medium tracking-[3px] mb-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              SELECT COMPETITORS
            </p>
            <h1
              className="text-4xl md:text-6xl lg:text-7xl font-medium leading-none"
              style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-primary)', letterSpacing: '-0.02em' }}
            >
              Build Your<br />
              <span style={{ color: 'var(--color-gold)' }}>Lineup.</span>
            </h1>
          </div>

          {/* Roster — agents as competitors, not form fields */}
          <div
            role="group"
            aria-label="Available agents"
            className="flex flex-col"
            style={{ borderTop: '1px solid var(--color-border)' }}
          >
            {ALL_AGENTS.map((agent, index) => {
              const sel   = isSelected(agent.id);
              const color = AGENT_COLORS[agent.id] ?? 'var(--color-gold)';
              const hov   = hoveredAgent === agent.id;

              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  onMouseEnter={() => setHoveredAgent(agent.id)}
                  onMouseLeave={() => setHoveredAgent(null)}
                  aria-pressed={sel}
                  aria-label={`${agent.label}${agent.suffix ? ' ' + agent.suffix : ''}${sel ? ' — selected' : ''}`}
                  className="relative flex items-center text-left cursor-pointer w-full group"
                  style={{
                    borderBottom: '1px solid var(--color-border)',
                    background: sel
                      ? `${color}08`
                      : hov ? 'var(--color-surface)' : 'transparent',
                    transition: 'background 0.15s ease',
                    transform:  mounted ? 'translateY(0)' : 'translateY(20px)',
                    opacity:    mounted ? 1 : 0,
                    transitionDelay: `${index * 55}ms`,
                    transitionProperty: 'background, transform, opacity',
                    transitionDuration: mounted ? '0.15s, 0.4s, 0.4s' : '0s',
                    transitionTimingFunction: 'ease, cubic-bezier(0.16,1,0.3,1), cubic-bezier(0.16,1,0.3,1)',
                  }}
                >
                  {/* Thick left accent bar — always visible, communicates color identity */}
                  <div
                    className="flex-shrink-0 self-stretch"
                    style={{
                      width: sel ? '4px' : '2px',
                      background: sel ? color : hov ? color : 'var(--color-border)',
                      transition: 'width 0.15s ease, background 0.15s ease',
                    }}
                    aria-hidden="true"
                  />

                  {/* Content */}
                  <div className="flex items-center gap-4 md:gap-6 px-5 md:px-8 py-4 md:py-5 flex-1 min-w-0">
                    {/* Index number */}
                    <span
                      className="text-xl md:text-2xl font-medium flex-shrink-0 w-6 md:w-8 text-right select-none"
                      style={{
                        fontFamily: 'Cormorant Garamond, serif',
                        color: sel ? color : 'var(--color-text-muted)',
                        transition: 'color 0.15s ease',
                      }}
                      aria-hidden="true"
                    >
                      {index + 1}
                    </span>

                    {/* Name block */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-baseline gap-2 md:gap-3 flex-wrap">
                        <span
                          className="text-lg md:text-xl font-medium leading-none"
                          style={{
                            fontFamily: 'Cormorant Garamond, serif',
                            color: sel ? color : 'var(--color-text-primary)',
                            transition: 'color 0.15s ease',
                          }}
                        >
                          {agent.label}
                        </span>
                        {agent.suffix && (
                          <span
                            className="text-xs font-medium tracking-[1px]"
                            style={{ color: sel ? color : 'var(--color-text-secondary)', transition: 'color 0.15s ease' }}
                          >
                            {agent.suffix.toUpperCase()}
                          </span>
                        )}
                        {/* Personality tag pill — always visible */}
                        <span
                          className="text-[9px] font-medium tracking-[1.5px] px-2 py-0.5 flex-shrink-0"
                          style={{
                            background: sel ? `${color}18` : 'transparent',
                            border: `1px solid ${sel ? color + '60' : 'var(--color-border)'}`,
                            color: sel ? color : 'var(--color-text-muted)',
                            transition: 'all 0.15s ease',
                          }}
                          aria-hidden="true"
                        >
                          {agent.tag.toUpperCase()}
                        </span>
                      </div>
                      {/* Description — only readable when hovered or selected */}
                      <p
                        className="text-xs mt-1 leading-snug"
                        style={{
                          color: 'var(--color-text-secondary)',
                          maxWidth: '48ch',
                          opacity: sel || hov ? 1 : 0.5,
                          transition: 'opacity 0.15s ease',
                        }}
                      >
                        {agent.desc}
                      </p>
                    </div>

                    {/* Selection state — right side */}
                    <div className="flex-shrink-0 flex items-center gap-3">
                      {sel ? (
                        <span
                          className="text-xs font-semibold tracking-[1px] select-none"
                          style={{ color }}
                        >
                          IN
                        </span>
                      ) : (
                        <span
                          className="text-xs tracking-[1px] select-none"
                          style={{ color: 'var(--color-text-muted)' }}
                        >
                          ADD
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Personality blurb — appears below roster, changes on hover/select */}
          <div
            className="hidden md:flex px-14 pt-5 pb-2 items-start gap-4"
            style={{ minHeight: '48px' }}
            aria-live="polite"
            aria-atomic="true"
          >
            {activeAgent && (
              <p
                className="text-xs italic leading-relaxed slide-up"
                style={{ color: 'var(--color-text-secondary)', maxWidth: '52ch' }}
              >
                "{activeAgent.personality}"
              </p>
            )}
          </div>
        </div>

        {/* Vertical divider — desktop only */}
        <div
          className="hidden lg:block flex-shrink-0"
          style={{ width: '1px', background: 'var(--color-border)' }}
          aria-hidden="true"
        />

        {/* ════════════════════════════════════════
            RIGHT — Config sidebar
        ════════════════════════════════════════ */}
        <div
          className="flex flex-col lg:w-[360px] xl:w-[400px] flex-shrink-0 border-t lg:border-t-0"
          style={{ borderColor: 'var(--color-border)' }}
        >
          {/* Lineup summary — shows who's in */}
          <div
            className="px-6 lg:px-8 pt-6 md:pt-8 pb-5"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <p className="text-[10px] font-medium tracking-[3px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
              LINEUP
            </p>
            {selectedCount === 0 ? (
              <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
                No agents selected
              </p>
            ) : (
              <div className="flex flex-col gap-1.5">
                {ALL_AGENTS.filter(a => isSelected(a.id)).map(a => {
                  const color = AGENT_COLORS[a.id] ?? 'var(--color-gold)';
                  return (
                    <div key={a.id} className="flex items-center gap-2">
                      <div
                        className="flex-shrink-0"
                        style={{ width: '3px', height: '14px', background: color }}
                        aria-hidden="true"
                      />
                      <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
                        {a.label}{a.suffix ? ` ${a.suffix}` : ''}
                      </span>
                      <span className="text-[9px] tracking-[1px] ml-auto" style={{ color }}>
                        {a.tag.toUpperCase()}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Settings */}
          <div
            className="flex flex-col px-6 lg:px-8 py-6"
            style={{ borderBottom: '1px solid var(--color-border)' }}
          >
            <p className="text-[10px] font-medium tracking-[3px] mb-5" style={{ color: 'var(--color-text-muted)' }}>
              PARAMETERS
            </p>

            <div className="flex flex-col gap-0" style={{ borderTop: '1px solid var(--color-border-sub)' }}>
              <CompactSetting
                label="Rounds"
                value={cfg.num_rounds}
                display={String(cfg.num_rounds)}
                min={1} max={500} step={5}
                onChange={v => setNum('num_rounds', v)}
              />
              <CompactSetting
                label="Base Bet"
                value={cfg.base_bet}
                display={`$${cfg.base_bet}`}
                min={1} max={500} step={5}
                onChange={v => setNum('base_bet', v)}
              />
              <CompactSetting
                label="Bankroll"
                value={cfg.starting_bankroll}
                display={`$${cfg.starting_bankroll.toLocaleString()}`}
                min={100} max={10000} step={100}
                onChange={v => setNum('starting_bankroll', v)}
              />
              <CompactSetting
                label="MCTS Sims"
                value={cfg.mcts_sims}
                display={String(cfg.mcts_sims)}
                min={20} max={2000} step={20}
                onChange={v => setNum('mcts_sims', v)}
              />
            </div>
          </div>

          {/* Scoring — compact, readable */}
          <div className="px-6 lg:px-8 py-5" style={{ borderBottom: '1px solid var(--color-border)' }}>
            <p className="text-[10px] font-medium tracking-[3px] mb-3" style={{ color: 'var(--color-text-muted)' }}>
              SCORING
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5">
              {[
                { outcome: 'Win',        pts: '3 pts',  color: 'var(--color-win-fg)'  },
                { outcome: 'Blackjack',  pts: '+2 pts', color: 'var(--color-gold)'    },
                { outcome: 'Push / Tie', pts: '1 pt',   color: 'var(--color-push-fg)' },
                { outcome: 'Loss',       pts: '0 pts',  color: 'var(--color-text-muted)' },
              ].map(({ outcome, pts, color }) => (
                <div key={outcome} className="flex items-center justify-between gap-2">
                  <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>{outcome}</span>
                  <span className="text-[10px] font-semibold" style={{ color }}>{pts}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Spacer so the bottom button area doesn't crowd content on short screens */}
          <div className="flex-1" />
        </div>
      </main>

      {/* ── Sticky bottom bar ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-4 px-4 md:px-8 lg:px-14"
        style={{
          height: '64px',
          background: 'var(--color-page)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {/* Agent count indicator */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="flex gap-1" aria-hidden="true">
            {ALL_AGENTS.map(a => {
              const sel   = isSelected(a.id);
              const color = AGENT_COLORS[a.id] ?? 'var(--color-gold)';
              return (
                <div
                  key={a.id}
                  style={{
                    width:      sel ? '20px' : '6px',
                    height:     '4px',
                    background: sel ? color : 'var(--color-border)',
                    transition: 'width 0.2s cubic-bezier(0.16,1,0.3,1), background 0.15s ease',
                  }}
                />
              );
            })}
          </div>
          <span className="text-xs hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
            {selectedCount === 0
              ? 'No agents'
              : `${selectedCount} of ${ALL_AGENTS.length}`}
          </span>
        </div>

        {/* Rounds summary — compact */}
        <div className="hidden md:flex items-center gap-1.5 text-xs flex-shrink-0" style={{ color: 'var(--color-text-muted)' }}>
          <span style={{ color: 'var(--color-text-secondary)' }}>{cfg.num_rounds}</span> rounds ·
          <span style={{ color: 'var(--color-text-secondary)' }}>${cfg.base_bet}</span> bet ·
          <span style={{ color: 'var(--color-text-secondary)' }}>${cfg.starting_bankroll.toLocaleString()}</span>
        </div>

        {/* Validation nudge */}
        {selectedCount === 0 && (
          <p className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-loss-fg)' }} aria-live="polite" role="status">
            Select at least one agent
          </p>
        )}

        {/* Run button — right-aligned */}
        <button
          onClick={handleStart}
          disabled={!canRun}
          aria-label={loading ? 'Simulating tournament, please wait' : 'Run tournament'}
          aria-busy={loading}
          className="ml-auto flex items-center justify-center gap-2.5 h-10 px-7 md:px-10 text-xs font-semibold tracking-[2px] transition-all cursor-pointer flex-shrink-0 disabled:cursor-not-allowed"
          style={{
            background: canRun ? 'var(--color-gold)' : 'transparent',
            color:      canRun ? 'var(--color-page)' : 'var(--color-text-muted)',
            border:    canRun ? 'none' : '1px solid var(--color-border)',
            transition: 'background 0.2s ease, color 0.2s ease, border 0.2s ease',
          }}
        >
          {loading ? <Spinner /> : null}
          {loading ? 'SIMULATING…' : 'RUN TOURNAMENT'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// CompactSetting — lean row: label left, value + steppers right, no slider
// ---------------------------------------------------------------------------

interface CompactSettingProps {
  label:    string;
  value:    number;
  display:  string;
  min:      number;
  max:      number;
  step:     number;
  onChange: (v: number) => void;
}

function CompactSetting({ label, value, display, min, max, step, onChange }: CompactSettingProps) {
  const id    = `cs-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const clamp = (v: number) => Math.max(min, Math.min(max, v));

  return (
    <div
      className="flex items-center justify-between gap-4 py-3"
      style={{ borderBottom: '1px solid var(--color-border-sub)' }}
    >
      <label
        htmlFor={id}
        className="text-xs font-medium select-none"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {label}
      </label>

      <div className="flex items-center flex-shrink-0" style={{ border: '1px solid var(--color-border)' }}>
        <button
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="w-8 h-8 flex items-center justify-center text-sm font-medium cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          style={{ borderRight: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >−</button>
        <span
          id={id}
          className="w-16 text-center text-xs font-semibold select-none"
          style={{ color: 'var(--color-gold)' }}
          aria-live="polite"
          aria-label={`${label}: ${display}`}
          role="status"
        >
          {display}
        </span>
        <button
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="w-8 h-8 flex items-center justify-center text-sm font-medium cursor-pointer disabled:opacity-20 disabled:cursor-not-allowed transition-colors flex-shrink-0"
          style={{ borderLeft: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >+</button>
      </div>
    </div>
  );
}
