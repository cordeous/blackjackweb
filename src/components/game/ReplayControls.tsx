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
    <div
      className="sticky bottom-0 z-10 flex flex-col gap-0"
      style={{ background: '#0A0A0A', borderTop: '1px solid #2A2A2A' }}
    >
      {/* Progress bar */}
      <div className="w-full h-0.5" style={{ background: '#1A1A1A' }}>
        <div
          className="h-full transition-all duration-300"
          style={{ width: `${progress}%`, background: '#C9A962' }}
        />
      </div>

      {/* Controls row */}
      <div className="flex items-center gap-1.5 md:gap-3 px-2 md:px-14 h-12 md:h-16 flex-wrap">

        {/* Menu — hidden on xs, shown sm+ */}
        <button
          onClick={onMenu}
          className="hidden sm:flex h-8 md:h-9 px-2 md:px-4 text-[10px] md:text-xs text-[#848484] hover:text-white transition cursor-pointer items-center"
          style={{ border: '1px solid #2A2A2A' }}
        >← Menu</button>

        <div className="hidden sm:block" style={{ width: '1px', height: '20px', background: '#2A2A2A' }} />

        {/* Rewind */}
        <button
          onClick={() => { controls.pause(); controls.jumpTo(0); }}
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#848484] hover:text-white transition cursor-pointer text-[10px] md:text-xs"
          style={{ border: '1px solid #2A2A2A' }}
        >◀◀</button>

        {/* Prev */}
        <button
          onClick={controls.prev}
          disabled={replay.eventIndex === 0}
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#848484] hover:text-white disabled:opacity-30 transition cursor-pointer text-sm"
          style={{ border: '1px solid #2A2A2A' }}
        >◀</button>

        {/* Play / Pause */}
        <button
          onClick={replay.isPlaying ? controls.pause : controls.play}
          className="w-10 h-8 md:w-12 md:h-9 flex items-center justify-center text-sm md:text-base font-bold transition cursor-pointer"
          style={{ background: '#C9A962', color: '#0A0A0A' }}
        >
          {replay.isPlaying ? '⏸' : '▶'}
        </button>

        {/* Next */}
        <button
          onClick={controls.next}
          disabled={replay.atEnd}
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#848484] hover:text-white disabled:opacity-30 transition cursor-pointer text-sm"
          style={{ border: '1px solid #2A2A2A' }}
        >▶</button>

        {/* Jump to end */}
        <button
          onClick={controls.jumpToEnd}
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-[#848484] hover:text-white transition cursor-pointer text-[10px] md:text-xs"
          style={{ border: '1px solid #2A2A2A' }}
        >▶▶</button>

        <div className="hidden sm:block" style={{ width: '1px', height: '20px', background: '#2A2A2A' }} />

        {/* Speed buttons */}
        <div className="flex gap-1">
          {SPEEDS.map(s => (
            <button
              key={s.ms}
              onClick={() => controls.setSpeed(s.ms)}
              className="h-7 md:h-8 px-1.5 md:px-3 text-[9px] md:text-xs transition cursor-pointer font-medium"
              style={{
                background: replay.speed === s.ms ? '#C9A962' : 'transparent',
                color:      replay.speed === s.ms ? '#0A0A0A' : '#848484',
                border:     `1px solid ${replay.speed === s.ms ? '#C9A962' : '#2A2A2A'}`,
              }}
            >{s.label}</button>
          ))}
        </div>

        {/* Frame counter — hidden on xs */}
        <span className="hidden sm:inline text-[10px] md:text-xs text-[#4A4A4A]" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
          {replay.eventIndex + 1}/{replay.totalEvents}
        </span>

        {/* Results button */}
        <button
          onClick={onLeaderboard}
          className="ml-auto h-8 md:h-9 px-3 md:px-5 text-[10px] md:text-xs font-semibold transition cursor-pointer"
          style={{ background: '#C9A962', color: '#0A0A0A' }}
        >
          Results →
        </button>
      </div>
    </div>
  );
}
