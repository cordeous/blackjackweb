import { useEffect, useState } from 'react';
import { useSession } from '../context/SessionContext';
import { runSession } from '../api/client';
import { AppHeader } from '../components/AppHeader';
import { AGENT_COLORS } from '../types/session';

const ALL_AGENTS = [
  { id: 'Random',                label: 'Random Agent',            desc: 'Selects actions randomly — baseline comparison'        },
  { id: 'Heuristic(basic)',      label: 'Heuristic (Basic)',        desc: 'Rule-based basic strategy — optimal play'              },
  { id: 'Heuristic(aggressive)', label: 'Heuristic (Aggressive)',   desc: 'Doubles and splits more often — high variance'         },
  { id: 'MCTS',                  label: 'MCTS Agent',               desc: 'Monte Carlo Tree Search — statistical lookahead'       },
  { id: 'DNN',                   label: 'DNN Agent',                desc: 'Deep Neural Network — trained on millions of hands'    },
];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export function MainMenuView() {
  const { state, dispatch } = useSession();
  const cfg = state.config;
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    document.title = 'Configure Tournament — Blackjack AI';
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

  const summaryText = `${cfg.agents.length} agent${cfg.agents.length !== 1 ? 's' : ''} · ${cfg.num_rounds} rounds · $${cfg.base_bet} bet · $${cfg.starting_bankroll.toLocaleString()}`;
  const canRun = cfg.agents.length > 0 && !loading;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: 'var(--color-page)' }}>

      <AppHeader
        actions={
          <span className="text-[10px] md:text-xs hidden sm:block" style={{ color: 'var(--color-text-secondary)' }}>
            Tournament Edition
          </span>
        }
      />

      {/* ── Hero ── */}
      <div
        className="flex flex-col items-center py-6 md:py-10 gap-1 md:gap-2 px-4 text-center"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <span className="text-[10px] md:text-xs font-medium tracking-[2px] md:tracking-[3px]" style={{ color: 'var(--color-text-secondary)' }}>
          MULTI-AGENT COMPETITION
        </span>
        <h1
          className="text-3xl md:text-5xl font-medium text-white"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >Configure Your Tournament</h1>
        <p className="text-xs md:text-sm" style={{ color: 'var(--color-text-secondary)' }}>
          Select agents, set stakes, and run the simulation
        </p>
      </div>

      {/* ── Error ── */}
      {state.error && (
        <div
          role="alert"
          className="mx-4 md:mx-14 mt-4 px-4 py-3 text-xs md:text-sm slide-up"
          style={{ border: '1px solid var(--color-loss)', background: 'var(--color-error-bg)', color: 'var(--color-loss-fg)' }}
        >⚠ {state.error}</div>
      )}

      {/* ── Body: stacked on mobile, side-by-side on desktop ── */}
      {/* pb-[80px] leaves room so the sticky footer never hides content */}
      <div className="flex flex-col md:flex-row flex-1 pb-[80px] md:pb-[72px]">

        {/* Agent selection */}
        <section
          className="flex flex-col gap-4 md:gap-6 px-4 md:px-14 py-6 md:py-10"
          style={{ width: '100%', maxWidth: '100%' }}
          aria-label="Agent selection"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Select Agents
            </h2>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>up to 5</span>
          </div>

          <div className="flex flex-col gap-2 md:gap-3" role="group" aria-label="Available agents">
            {ALL_AGENTS.map(agent => {
              const sel = isSelected(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  aria-pressed={sel}
                  aria-label={`${agent.label}${sel ? ' — selected' : ''}`}
                  className="flex items-center gap-3 md:gap-4 h-14 md:h-16 px-4 md:px-5 text-left transition-all cursor-pointer w-full"
                  style={{
                    border:     `1px solid ${sel ? (AGENT_COLORS[agent.id] ?? 'var(--color-gold)') : 'var(--color-border)'}`,
                    background: sel ? `${(AGENT_COLORS[agent.id] ?? 'var(--color-gold)')}10` : 'transparent',
                  }}
                >
                  <div
                    className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0"
                    style={{ background: sel ? (AGENT_COLORS[agent.id] ?? 'var(--color-gold)') : 'var(--color-border)' }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate" style={{ color: sel ? (AGENT_COLORS[agent.id] ?? 'var(--color-gold)') : 'var(--color-text-primary)' }}>
                      {agent.label}
                    </div>
                    <div className="text-[10px] md:text-xs mt-0.5 truncate" style={{ color: 'var(--color-text-secondary)' }}>
                      {agent.desc}
                    </div>
                  </div>
                  {sel && (
                    <div
                      className="px-2 py-1 text-[9px] md:text-[10px] font-medium flex-shrink-0"
                      style={{ border: '1px solid var(--color-gold-dim)', color: 'var(--color-gold)' }}
                      aria-hidden="true"
                    >✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Divider */}
        <div className="md:hidden mx-4" style={{ height: '1px', background: 'var(--color-border)' }} aria-hidden="true" />
        <div className="hidden md:block flex-shrink-0" style={{ width: '1px', background: 'var(--color-border)' }} aria-hidden="true" />

        {/* Settings */}
        <section className="flex flex-col gap-5 md:gap-8 px-4 md:px-10 py-6 md:py-10 md:flex-1" aria-label="Tournament settings">
          <h2 className="text-xl md:text-2xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Settings
          </h2>

          <div className="grid grid-cols-2 gap-3 md:gap-5">
            <NumField label="Rounds" displayLabel="ROUNDS" value={cfg.num_rounds}
              min={1} max={500} step={5} onChange={v => setNum('num_rounds', v)} />
            <NumField label="Base bet" displayLabel="BASE BET ($)" value={cfg.base_bet}
              min={1} max={500} step={5} onChange={v => setNum('base_bet', v)} />
            <NumField label="Bankroll" displayLabel="BANKROLL ($)" value={cfg.starting_bankroll}
              min={100} max={10000} step={100} onChange={v => setNum('starting_bankroll', v)} />
            <NumField label="MCTS simulations" displayLabel="MCTS SIMS" value={cfg.mcts_sims}
              min={20} max={2000} step={20} onChange={v => setNum('mcts_sims', v)} />
          </div>
        </section>
      </div>

      {/* ── Sticky Run footer — always visible ── */}
      <div
        className="fixed bottom-0 left-0 right-0 z-20 flex items-center gap-3 md:gap-6 px-4 md:px-14"
        style={{
          height: '72px',
          background: 'var(--color-page)',
          borderTop: '1px solid var(--color-border)',
        }}
      >
        {/* Summary */}
        <div className="flex-1 min-w-0 hidden sm:block">
          <div
            className="text-[10px] font-medium tracking-[2px]"
            style={{ color: 'var(--color-text-secondary)', marginBottom: '2px' }}
          >
            TOURNAMENT SUMMARY
          </div>
          <div
            className="text-xs text-white truncate"
            aria-live="polite"
            aria-label="Tournament summary"
          >
            {summaryText}
          </div>
        </div>

        {/* Scoring hint */}
        <div className="text-[9px] md:text-[10px] flex-shrink-0 hidden md:block" style={{ color: 'var(--color-text-muted)' }}>
          Win 3 · Tie 1 · BJ +2
        </div>

        {/* Error / empty hint */}
        {cfg.agents.length === 0 && (
          <p className="text-[10px] flex-shrink-0" style={{ color: 'var(--color-loss-fg)' }} aria-live="polite" role="status">
            Select an agent
          </p>
        )}

        {/* Run button */}
        <button
          onClick={handleStart}
          disabled={!canRun}
          aria-label={loading ? 'Simulating tournament, please wait' : 'Run tournament'}
          aria-busy={loading}
          className="flex items-center justify-center gap-2 h-11 px-6 md:px-10 text-xs md:text-sm font-semibold tracking-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
          style={{ background: 'var(--color-gold)', color: 'var(--color-page)' }}
        >
          {loading ? <Spinner /> : <span aria-hidden="true">▶</span>}
          {loading ? 'SIMULATING…' : 'RUN TOURNAMENT'}
        </button>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NumField
// ---------------------------------------------------------------------------

interface NumFieldProps {
  label: string;
  displayLabel: string;
  value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}

function NumField({ label, displayLabel, value, min, max, step, onChange }: NumFieldProps) {
  const id     = `numfield-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hintId = `${id}-hint`;
  const clamp  = (v: number) => Math.max(min, Math.min(max, v));

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const raw = e.target.value;
    if (raw === '' || raw === '-') return;
    const n = Number(raw);
    if (!Number.isFinite(n)) return;
    onChange(clamp(n));
  }

  function handleBlur(e: React.FocusEvent<HTMLInputElement>) {
    const n = Number(e.target.value);
    if (!Number.isFinite(n) || e.target.value === '') {
      onChange(value);
    } else {
      onChange(clamp(n));
    }
  }

  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      <label
        htmlFor={id}
        className="text-[9px] md:text-[11px] font-medium tracking-[1px] md:tracking-[2px]"
        style={{ color: 'var(--color-text-secondary)' }}
      >
        {displayLabel}
      </label>
      <div className="flex items-center h-10 md:h-12" style={{ border: '1px solid var(--color-border)' }}>
        <button
          onClick={() => onChange(clamp(value - step))}
          disabled={value <= min}
          aria-label={`Decrease ${label}`}
          className="h-full px-2 md:px-4 transition text-sm font-medium cursor-pointer flex-shrink-0 min-w-[44px] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderRight: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >−</button>
        <input
          id={id}
          type="number"
          value={value}
          min={min} max={max} step={step}
          inputMode="numeric"
          onChange={handleInputChange}
          onBlur={handleBlur}
          aria-label={label}
          aria-describedby={hintId}
          className="flex-1 bg-transparent text-center text-xs md:text-sm text-white focus:outline-none py-2 w-0"
        />
        <button
          onClick={() => onChange(clamp(value + step))}
          disabled={value >= max}
          aria-label={`Increase ${label}`}
          className="h-full px-2 md:px-4 transition text-sm font-medium cursor-pointer flex-shrink-0 min-w-[44px] disabled:opacity-30 disabled:cursor-not-allowed"
          style={{ borderLeft: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >+</button>
      </div>
      <span id={hintId} className="sr-only">{min} to {max}</span>
    </div>
  );
}
