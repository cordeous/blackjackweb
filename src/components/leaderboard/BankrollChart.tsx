import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
  ResponsiveContainer,
} from 'recharts';
import type { SessionResult, LeaderboardEntry } from '../../types/session';
import { AGENT_COLORS } from '../../types/session';

interface Props {
  session: SessionResult;
}

export function BankrollChart({ session }: Props) {
  if (!session.rounds.length) return null;

  // Build data array: one entry per round, one key per agent
  const data = session.rounds.map(round => {
    const entry: Record<string, number | string> = { round: round.round_num };
    round.agent_results.forEach(ar => {
      entry[ar.agent_name] = ar.bankroll_after;
    });
    return entry;
  });

  // Unique agent names in leaderboard order
  const agents: LeaderboardEntry[] = session.leaderboard;

  const customTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
      <div
        className="px-3 py-2 text-xs"
        style={{ background: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="mb-1 font-semibold" style={{ color: 'var(--color-gold)' }}>Round {label}</div>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-2">
            <div className="w-2 h-2 flex-shrink-0" style={{ background: p.color }} />
            <span style={{ color: p.color }}>{p.dataKey}:</span>
            <span className="text-white" style={{ fontFamily: 'JetBrains Mono, monospace' }}>${p.value}</span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <ResponsiveContainer width="100%" height={260}>
      <LineChart data={data} margin={{ top: 8, right: 20, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(42,42,42,0.8)" />
        <XAxis
          dataKey="round"
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
          label={{ value: 'Round', position: 'insideBottom', fill: 'var(--color-text-secondary)', fontSize: 11, dy: 10 }}
        />
        <YAxis
          tick={{ fill: 'var(--color-text-secondary)', fontSize: 11 }}
          tickFormatter={(v) => `$${v}`}
          width={58}
        />
        <Tooltip content={customTooltip} />
        <Legend
          wrapperStyle={{ fontSize: 11, paddingTop: 8, color: 'var(--color-text-secondary)' }}
          formatter={(value) => <span style={{ color: AGENT_COLORS[value] ?? 'var(--color-text-secondary)' }}>{value}</span>}
        />
        <ReferenceLine
          y={session.starting_bankroll}
          stroke="#2A2A2A"
          strokeDasharray="4 3"
          label={{ value: 'Start', fill: 'var(--color-text-secondary)', fontSize: 10, position: 'right' }}
        />
        {agents.map((entry) => (
          <Line
            key={entry.name}
            type="monotone"
            dataKey={entry.name}
            stroke={AGENT_COLORS[entry.name] ?? '#848484'}
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 4 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
}
