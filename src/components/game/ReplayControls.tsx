import type { ReplayState, ReplayControls, ReplaySpeed } from '../../hooks/useReplay';

const SPEEDS: { label: string; ms: ReplaySpeed }[] = [
  { label: '0.5×', ms: 3200 },
  { label: '1×',   ms: 1600 },
  { label: '2×',   ms: 800  },
  { label: '4×',   ms: 400  },
];

interface Props {
  replay:        ReplayState;
  controls:      ReplayControls;
  onLeaderboard: () => void;
  onMenu:        () => void;
}

export function ReplayControls({ replay, controls, onLeaderboard, onMenu }: Props) {
  const progress = replay.totalEvents > 1
    ? (replay.eventIndex / (replay.totalEvents - 1)) * 100
    : 0;

  return (
    <nav
      className="sticky bottom-0 z-10 flex flex-col gap-0"
      style={{ background: 'var(--color-page)', borderTop: '1px solid var(--color-border)' }}
      aria-label="Replay controls"
    >
      {/* Progress bar */}
      <div className="w-full h-0.5" style={{ background: 'var(--color-border-sub)' }} role="presentation">
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: 'var(--color-gold)' }}
        />
      </div>

      {/* Controls row — no flex-wrap; hidden elements control overflow at each breakpoint */}
      <div className="flex items-center gap-1.5 md:gap-3 px-2 md:px-14 h-14 md:h-16 overflow-hidden">

        {/* Menu — icon on xs, text on sm+ */}
        <button
          onClick={onMenu}
          aria-label="Back to menu"
          className="flex items-center justify-center w-11 h-11 md:h-9 md:w-auto md:px-4 text-[10px] md:text-xs transition cursor-pointer flex-shrink-0"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >
          <span className="md:hidden" aria-hidden="true">☰</span>
          <span className="hidden md:inline">← Menu</span>
        </button>

        <div className="hidden md:block flex-shrink-0" style={{ width: '1px', height: '20px', background: 'var(--color-border)' }} aria-hidden="true" />

        {/* Rewind */}
        <button
          onClick={() => { controls.pause(); controls.jumpTo(0); }}
          aria-label="Rewind to start"
          className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center transition cursor-pointer text-[10px] md:text-xs flex-shrink-0"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >◀◀</button>

        {/* Prev */}
        <button
          onClick={controls.prev}
          disabled={replay.eventIndex === 0}
          aria-label="Previous frame"
          className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center disabled:opacity-30 transition cursor-pointer text-sm flex-shrink-0"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >◀</button>

        {/* Play / Pause */}
        <button
          onClick={replay.isPlaying ? controls.pause : controls.play}
          aria-label={replay.isPlaying ? 'Pause replay' : 'Play replay'}
          aria-pressed={replay.isPlaying}
          className="w-11 h-11 md:w-12 md:h-9 flex items-center justify-center text-sm md:text-base font-bold transition cursor-pointer flex-shrink-0"
          style={{ background: 'var(--color-gold)', color: 'var(--color-page)' }}
        >
          {replay.isPlaying ? '⏸' : '▶'}
        </button>

        {/* Next */}
        <button
          onClick={controls.next}
          disabled={replay.atEnd}
          aria-label="Next frame"
          className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center disabled:opacity-30 transition cursor-pointer text-sm flex-shrink-0"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >▶</button>

        {/* Jump to end */}
        <button
          onClick={controls.jumpToEnd}
          aria-label="Jump to end"
          className="w-11 h-11 md:w-9 md:h-9 flex items-center justify-center transition cursor-pointer text-[10px] md:text-xs flex-shrink-0"
          style={{ border: '1px solid var(--color-border)', color: 'var(--color-text-secondary)' }}
        >▶▶</button>

        <div className="hidden md:block flex-shrink-0" style={{ width: '1px', height: '20px', background: 'var(--color-border)' }} aria-hidden="true" />

        {/* Speed buttons — h-11 on mobile (44px), h-9 on desktop (36px) */}
        <div className="flex gap-1 flex-shrink-0" role="group" aria-label="Playback speed">
          {SPEEDS.map(s => (
            <button
              key={s.ms}
              onClick={() => controls.setSpeed(s.ms)}
              aria-label={`Set speed to ${s.label}`}
              aria-pressed={replay.speed === s.ms}
              className="h-11 md:h-9 px-1.5 md:px-3 text-[9px] md:text-xs transition cursor-pointer font-medium min-w-[44px] md:min-w-0 flex-shrink-0"
              style={{
                background: replay.speed === s.ms ? 'var(--color-gold)' : 'transparent',
                color:      replay.speed === s.ms ? 'var(--color-page)' : 'var(--color-text-secondary)',
                border:     `1px solid ${replay.speed === s.ms ? 'var(--color-gold)' : 'var(--color-border)'}`,
              }}
            >{s.label}</button>
          ))}
        </div>

        {/* Frame counter — hidden on xs and sm, shown md+ only to avoid overflow */}
        <span
          className="hidden md:inline text-xs flex-shrink-0"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'JetBrains Mono, monospace' }}
          aria-label={`Frame ${replay.eventIndex + 1} of ${replay.totalEvents}`}
        >
          {replay.eventIndex + 1}/{replay.totalEvents}
        </span>

        {/* Results button — pushed to end */}
        <button
          onClick={onLeaderboard}
          aria-label="View final results"
          className="ml-auto h-11 md:h-9 px-3 md:px-5 text-[10px] md:text-xs font-semibold transition cursor-pointer flex-shrink-0"
          style={{ background: 'var(--color-gold)', color: 'var(--color-page)' }}
        >
          Results →
        </button>
      </div>
    </nav>
  );
}
