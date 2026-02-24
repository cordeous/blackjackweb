import type { RunConfig, SessionResult } from '../types/session';

// Local dev: Vite proxies /health, /agents, /run → http://localhost:8000 (see vite.config.ts)
// Production: set VITE_API_URL to your backend Vercel URL in the Vercel dashboard
const BASE = (import.meta as any).env?.VITE_API_URL ?? '';

export async function getHealth(): Promise<boolean> {
  try {
    const r = await fetch(`${BASE}/health`);
    return r.ok;
  } catch {
    return false;
  }
}

export async function getAgents(): Promise<string[]> {
  const r = await fetch(`${BASE}/agents`);
  if (!r.ok) throw new Error('Failed to fetch agents');
  const d = await r.json();
  return d.agents as string[];
}

export async function runSession(config: RunConfig): Promise<SessionResult> {
  const r = await fetch(`${BASE}/run`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(config),
  });
  if (!r.ok) {
    const text = await r.text();
    let msg = text;
    try { msg = JSON.parse(text).detail ?? text; } catch { /* keep raw text */ }
    throw new Error(msg);
  }
  return r.json() as Promise<SessionResult>;
}
