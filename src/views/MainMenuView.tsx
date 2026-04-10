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
          className="text-3xl md:text-5xl font-medium"
          style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-primary)' }}
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
      <main id="main-content" className="flex flex-col md:flex-row flex-1 pb-[80px] md:pb-[72px]">

        {/* ── Agent selection ── */}
        <section
          className="flex flex-col gap-4 md:gap-6 px-4 md:px-14 py-6 md:py-10 md:flex-1"
          aria-label="Agent selection"
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-medium" style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-primary)' }}>
              Select Agents
            </h2>
            <span className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>up to 5</span>
          </div>

          <div className="flex flex-col gap-2 md:gap-3" role="group" aria-label="Available agents">
            {ALL_AGENTS.map(agent => {
              const sel = isSelected(agent.id);
              const color = AGENT_COLORS[agent.id] ?? 'var(--color-gold)';
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  aria-pressed={sel}
                  aria-label={`${agent.label}${sel ? ' — selected' : ''}`}
                  className="flex items-center gap-3 md:gap-4 h-14 md:h-16 px-4 md:px-5 text-left transition-all cursor-pointer w-full"
                  style={{
                    border:     `1px solid ${sel ? color : 'var(--color-border)'}`,
                    background: sel ? `${color}10` : 'transparent',
                  }}
                >
                  <div
                    className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0 transition-colors"
                    style={{ background: sel ? color : 'var(--color-border)' }}
                    aria-hidden="true"
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate" style={{ color: sel ? color : 'var(--color-text-primary)' }}>
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

        {/* ── Settings ── */}
        <section
          className="flex flex-col px-4 md:px-10 py-6 md:py-10 md:w-[420px] lg:w-[480px] flex-shrink-0"
          aria-label="Tournament settings"
        >
          <h2
            className="text-xl md:text-2xl font-medium mb-6 md:mb-8"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-primary)' }}
          >
            Settings
          </h2>

          <div className="flex flex-col divide-y" style={{ borderTop: '1px solid var(--color-border)', borderBottom: '1px solid var(--color-border)' }}>
            <SettingRow
              label="Rounds"
              hint="Number of hands each agent plays"
              value={cfg.num_rounds}
              display={String(cfg.num_rounds)}
              min={1} max={500} step={5}
              onChange={v => setNum('num_rounds', v)}
            />
            <SettingRow
              label="Base Bet"
              hint="Wager placed at the start of each hand"
              value={cfg.base_bet}
              display={`$${cfg.base_bet}`}
              min={1} max={500} step={5}
              onChange={v => setNum('base_bet', v)}
            />
            <SettingRow
              label="Starting Bankroll"
              hint="Initial balance for each agent"
              value={cfg.starting_bankroll}
              display={`$${cfg.starting_bankroll.toLocaleString()}`}
              min={100} max={10000} step={100}
              onChange={v => setNum('starting_bankroll', v)}
            />
            <SettingRow
              label="MCTS Simulations"
              hint="Tree search depth — higher is slower but stronger"
              value={cfg.mcts_sims}
              display={String(cfg.mcts_sims)}
              min={20} max={2000} step={20}
              onChange={v => setNum('mcts_sims', v)}
            />
          </div>

          {/* Scoring legend */}
          <div className="mt-6 md:mt-8 flex items-start gap-3">
            <span className="text-[9px] font-medium tracking-[2px] flex-shrink-0 mt-0.5" style={{ color: 'var(--color-text-muted)' }}>SCORING</span>
            <div className="flex flex-wrap gap-x-4 gap-y-1">
              {[
                { label: 'Win',       value: '3 pts' },
                { label: 'Tie / Push', value: '1 pt'  },
                { label: 'Blackjack bonus', value: '+2 pts' },
                { label: 'Loss',      value: '0 pts' },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-baseline gap-1.5">
                  <span className="text-[10px] md:text-xs font-medium" style={{ color: 'var(--color-text-primary)' }}>{value}</span>
                  <span className="text-[9px] md:text-[10px]" style={{ color: 'var(--color-text-muted)' }}>{label}</span>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* ── Sticky Run footer ── */}
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
          <div className="text-[10px] font-medium tracking-[2px]" style={{ color: 'var(--color-text-secondary)', marginBottom: '2px' }}>
            TOURNAMENT SUMMARY
          </div>
          <div className="text-xs truncate" style={{ color: 'var(--color-text-primary)' }} aria-live="polite" aria-label="Tournament summary">
            {summaryText}
          </div>
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
// SettingRow — full-width row with label, hint, value display, slider + steppers
// ---------------------------------------------------------------------------

interface SettingRowProps {
  label:    string;
  hint:     string;
  value:    number;
  display:  string;
  min:      number;
  max:      number;
  step:     number;
  onChange: (v: number) => void;
}

function SettingRow({ label, hint, value, display, min, max, step, onChange }: SettingRowProps) {
  const id      = `setting-${label.toLowerCase().replace(/\s+/g, '-')}`;
  const hintId  = `${id}-hint`;
  const clamp   = (v: number) => Math.max(min, Math.min(max, v));
  const pct     = ((value - min) / (max - min)) * 100;

  function handleSlider(e: React.ChangeEvent<HTMLInputElement>) {
    onChange(clamp(Number(e.target.value)));
  }

  return (
    <div className="flex flex-col gap-3 py-4 md:py-5">
      {/* Top row: label + value */}
      <div className="flex items-baseline justify-between gap-4">
        <div className="flex flex-col gap-0.5 min-w-0">
          <label
            htmlFor={id}
            className="text-sm font-medium"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {label}
          </label>
          <span id={hintId} className="text-[10px] md:text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {hint}
          </span>
        </div>

        {/* Value + steppers */}
        <div className="flex items-center gap-0 flex-shrink-0" style={{ border: '1px solid var(--color-border)' }}>
          <button
            onClick={() => onChange(clamp(value - step))}
            disabled={value <= min}
            aria-label={`Decrease ${label}`}
            className="w-9 h-9 flex items-center justify-center text-base font-medium transition cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0"
            style={{ borderRight: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >−</button>
          <span
            className="w-20 text-center text-sm font-medium select-none"
            style={{ color: 'var(--color-gold)' }}
            aria-live="polite"
            aria-label={`${label}: ${display}`}
          >
            {display}
          </span>
          <button
            onClick={() => onChange(clamp(value + step))}
            disabled={value >= max}
            aria-label={`Increase ${label}`}
            className="w-9 h-9 flex items-center justify-center text-base font-medium transition cursor-pointer disabled:opacity-25 disabled:cursor-not-allowed flex-shrink-0"
            style={{ borderLeft: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
          >+</button>
        </div>
      </div>

      {/* Slider track */}
      <div className="relative flex items-center" style={{ height: '20px' }}>
        {/* Filled portion */}
        <div
          className="absolute left-0 top-1/2 -translate-y-1/2 h-px pointer-events-none"
          style={{ width: `${pct}%`, background: 'var(--color-gold)' }}
          aria-hidden="true"
        />
        {/* Unfilled portion */}
        <div
          className="absolute top-1/2 -translate-y-1/2 h-px pointer-events-none"
          style={{ left: `${pct}%`, right: 0, background: 'var(--color-border)' }}
          aria-hidden="true"
        />
        <input
          id={id}
          type="range"
          min={min} max={max} step={step}
          value={value}
          onChange={handleSlider}
          aria-describedby={hintId}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={display}
          className="w-full cursor-pointer"
          style={{
            appearance: 'none',
            WebkitAppearance: 'none',
            background: 'transparent',
            height: '20px',
            position: 'relative',
            zIndex: 1,
          }}
        />
      </div>

      {/* Range labels */}
      <div className="flex justify-between">
        <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{min === 1 ? min : min.toLocaleString()}</span>
        <span className="text-[9px]" style={{ color: 'var(--color-text-muted)' }}>{max.toLocaleString()}</span>
      </div>
    </div>
  );
}
