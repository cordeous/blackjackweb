import { useState } from 'react';
import { useSession } from '../context/SessionContext';
import { runSession } from '../api/client';

const ALL_AGENTS = [
  { id: 'Random',                label: 'Random Agent',            desc: 'Selects actions randomly — baseline comparison',          color: '#f59e0b' },
  { id: 'Heuristic(basic)',      label: 'Heuristic (Basic)',        desc: 'Rule-based basic strategy — optimal play',                color: '#38bdf8' },
  { id: 'Heuristic(aggressive)', label: 'Heuristic (Aggressive)',   desc: 'Doubles and splits more often — high variance',           color: '#fb923c' },
  { id: 'MCTS',                  label: 'MCTS Agent',               desc: 'Monte Carlo Tree Search — statistical lookahead',         color: '#a78bfa' },
  { id: 'DNN',                   label: 'DNN Agent',                desc: 'Deep Neural Network — trained on millions of hands',      color: '#34d399' },
];

function Spinner() {
  return (
    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
    </svg>
  );
}

export function MainMenuView() {
  const { state, dispatch } = useSession();
  const cfg = state.config;
  const [loading, setLoading] = useState(false);

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
    if (cfg.agents.length === 0) return;
    setLoading(true);
    dispatch({ type: 'START_LOADING' });
    try {
      const session = await runSession(cfg);
      dispatch({ type: 'SESSION_LOADED', session });
    } catch (err: any) {
      dispatch({ type: 'SESSION_ERROR', error: err.message ?? 'Unknown error' });
      setLoading(false);
    }
  }

  const summaryText = `${cfg.agents.length} agent${cfg.agents.length !== 1 ? 's' : ''} · ${cfg.num_rounds} rounds · $${cfg.base_bet} bet · $${cfg.starting_bankroll.toLocaleString()}`;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#0A0A0A' }}>

      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 md:px-14 h-14 md:h-[72px] flex-shrink-0"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        <div className="flex items-center gap-2 md:gap-3">
          <div
            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-base md:text-lg font-semibold flex-shrink-0"
            style={{ border: '1px solid #C9A962', color: '#C9A962', fontFamily: 'Cormorant Garamond, serif' }}
          >♠</div>
          <span className="text-xs md:text-sm font-medium tracking-[2px] md:tracking-[3px] text-white">BLACKJACK AI</span>
        </div>
        <span className="text-[10px] md:text-xs text-[#848484] hidden sm:block">Tournament Edition</span>
      </header>

      {/* ── Hero ── */}
      <div
        className="flex flex-col items-center py-6 md:py-10 gap-1 md:gap-2 px-4 text-center"
        style={{ borderBottom: '1px solid #2A2A2A' }}
      >
        <span className="text-[10px] md:text-xs font-medium tracking-[2px] md:tracking-[3px] text-[#848484]">MULTI-AGENT COMPETITION</span>
        <h1
          className="text-3xl md:text-5xl font-medium text-white"
          style={{ fontFamily: 'Cormorant Garamond, serif' }}
        >Configure Your Tournament</h1>
        <p className="text-xs md:text-sm text-[#848484]">Select agents, set stakes, and run the simulation</p>
      </div>

      {/* ── Error ── */}
      {state.error && (
        <div
          className="mx-4 md:mx-14 mt-4 px-4 py-3 text-xs md:text-sm slide-up"
          style={{ border: '1px solid #dc2626', background: 'rgba(220,38,38,0.08)', color: '#fca5a5' }}
        >⚠ {state.error}</div>
      )}

      {/* ── Body: stacked on mobile, side-by-side on desktop ── */}
      <div className="flex flex-col md:flex-row flex-1">

        {/* Agent selection */}
        <section
          className="flex flex-col gap-4 md:gap-6 px-4 md:px-14 py-6 md:py-10"
          style={{ width: '100%', maxWidth: '100%' }}
        >
          <div className="flex items-center justify-between">
            <h2 className="text-xl md:text-2xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
              Select Agents
            </h2>
            <span className="text-xs text-[#848484]">up to 5</span>
          </div>

          <div className="flex flex-col gap-2 md:gap-3">
            {ALL_AGENTS.map(agent => {
              const sel = isSelected(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  className="flex items-center gap-3 md:gap-4 h-14 md:h-16 px-4 md:px-5 text-left transition-all cursor-pointer w-full"
                  style={{
                    border:     `1px solid ${sel ? agent.color : '#2A2A2A'}`,
                    background: sel ? `${agent.color}10` : 'transparent',
                  }}
                >
                  <div
                    className="w-2 h-2 md:w-2.5 md:h-2.5 rounded-full flex-shrink-0"
                    style={{ background: sel ? agent.color : '#2A2A2A' }}
                  />
                  <div className="flex-1 min-w-0 text-left">
                    <div className="text-sm font-medium truncate" style={{ color: sel ? agent.color : '#FFFFFF' }}>
                      {agent.label}
                    </div>
                    <div className="text-[10px] md:text-xs mt-0.5 text-[#848484] truncate">{agent.desc}</div>
                  </div>
                  {sel && (
                    <div
                      className="px-2 py-1 text-[9px] md:text-[10px] font-medium flex-shrink-0"
                      style={{ border: '1px solid rgba(201,169,98,0.4)', color: '#C9A962' }}
                    >✓</div>
                  )}
                </button>
              );
            })}
          </div>
        </section>

        {/* Divider — horizontal on mobile, vertical on desktop */}
        <div
          className="md:hidden mx-4"
          style={{ height: '1px', background: '#2A2A2A' }}
        />
        <div
          className="hidden md:block flex-shrink-0"
          style={{ width: '1px', background: '#2A2A2A' }}
        />

        {/* Settings */}
        <section className="flex flex-col gap-5 md:gap-8 px-4 md:px-10 py-6 md:py-10 md:flex-1">
          <h2 className="text-xl md:text-2xl font-medium text-white" style={{ fontFamily: 'Cormorant Garamond, serif' }}>
            Settings
          </h2>

          {/* 2-col grid on all sizes */}
          <div className="grid grid-cols-2 gap-3 md:gap-5">
            <NumField label="ROUNDS" value={cfg.num_rounds}
              min={1} max={500} step={5} onChange={v => setNum('num_rounds', v)} />
            <NumField label="BASE BET ($)" value={cfg.base_bet}
              min={1} max={500} step={5} onChange={v => setNum('base_bet', v)} />
            <NumField label="BANKROLL ($)" value={cfg.starting_bankroll}
              min={100} max={10000} step={100} onChange={v => setNum('starting_bankroll', v)} />
            <NumField label="MCTS SIMS" value={cfg.mcts_sims}
              min={20} max={2000} step={20} onChange={v => setNum('mcts_sims', v)} />
          </div>

          {/* Summary box */}
          <div
            className="px-4 py-3 md:px-5 md:py-4"
            style={{ border: '1px solid rgba(201,169,98,0.4)', background: 'rgba(201,169,98,0.04)' }}
          >
            <div className="text-[10px] md:text-[11px] font-medium tracking-[2px] text-[#848484] mb-1">TOURNAMENT SUMMARY</div>
            <div className="text-xs md:text-sm text-white">{summaryText}</div>
          </div>

          {/* Point system */}
          <div className="text-[10px] md:text-xs text-[#848484]">
            <span className="text-[#C9A962] font-medium">Scoring: </span>
            Win = 3 · Tie = 1 · Loss = 0 · Blackjack +2
          </div>

          {/* Run button */}
          <button
            onClick={handleStart}
            disabled={cfg.agents.length === 0 || loading}
            className="flex items-center justify-center gap-3 h-12 md:h-14 text-xs md:text-sm font-semibold tracking-[2px] transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
            style={{ background: '#C9A962', color: '#0A0A0A' }}
          >
            {loading ? <Spinner /> : <span>▶</span>}
            {loading ? 'SIMULATING…' : 'RUN TOURNAMENT'}
          </button>
          {cfg.agents.length === 0 && (
            <p className="text-[10px] text-center" style={{ color: '#f87171' }}>Select at least one agent</p>
          )}
        </section>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// NumField
// ---------------------------------------------------------------------------

interface NumFieldProps {
  label: string; value: number; min: number; max: number; step: number;
  onChange: (v: number) => void;
}

function NumField({ label, value, min, max, step, onChange }: NumFieldProps) {
  const clamp = (v: number) => Math.max(min, Math.min(max, v));
  return (
    <div className="flex flex-col gap-1.5 md:gap-2">
      <label className="text-[9px] md:text-[11px] font-medium tracking-[1px] md:tracking-[2px] text-[#848484]">{label}</label>
      <div className="flex items-center h-10 md:h-12" style={{ border: '1px solid #2A2A2A' }}>
        <button
          onClick={() => onChange(clamp(value - step))}
          className="h-full px-2 md:px-4 text-[#848484] hover:text-white transition text-xs cursor-pointer flex-shrink-0"
          style={{ borderRight: '1px solid #2A2A2A' }}
        >▼</button>
        <input
          type="number"
          value={value}
          min={min} max={max} step={step}
          onChange={e => onChange(clamp(Number(e.target.value)))}
          className="flex-1 bg-transparent text-center text-xs md:text-sm text-white focus:outline-none py-2 w-0"
        />
        <button
          onClick={() => onChange(clamp(value + step))}
          className="h-full px-2 md:px-4 text-[#848484] hover:text-white transition text-xs cursor-pointer flex-shrink-0"
          style={{ borderLeft: '1px solid #2A2A2A' }}
        >▲</button>
      </div>
    </div>
  );
}
