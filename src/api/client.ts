import type { RunConfig, SessionResult } from '../types/session';

// Local dev: Vite proxies /health, /agents, /run → http://localhost:8000 (see vite.config.ts)
// Production: set VITE_API_URL to your backend Vercel URL in the Vercel dashboard
const BASE = (import.meta as any).env?.VITE_API_URL ?? '';

/** Milliseconds before a request is considered timed out. */
const TIMEOUT_MS = 60_000;

/**
 * Wraps fetch with an AbortController timeout.
 * Throws a user-friendly Error on network failure, timeout, or non-ok status.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = TIMEOUT_MS,
): Promise<Response> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out — the server took too long to respond. Try again.');
    }
    // TypeError from fetch = no network / CORS / DNS failure
    throw new Error('Could not reach the server. Check your connection and try again.');
  } finally {
    clearTimeout(timer);
  }
}

/** Active run controller — cancelled if a second run is triggered before the first completes. */
let activeRunController: AbortController | null = null;

export async function getHealth(): Promise<boolean> {
  try {
    const r = await fetchWithTimeout(`${BASE}/health`, {}, 5_000);
    return r.ok;
  } catch {
    return false;
  }
}

export async function getAgents(): Promise<string[]> {
  const r = await fetchWithTimeout(`${BASE}/agents`);
  if (!r.ok) throw new Error(`Failed to fetch agents (${r.status})`);
  const d = await r.json();
  return d.agents as string[];
}

export async function runSession(config: RunConfig): Promise<SessionResult> {
  // Cancel any in-flight run before starting a new one
  if (activeRunController) {
    activeRunController.abort();
  }
  activeRunController = new AbortController();
  const controller = activeRunController;
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    const r = await fetch(`${BASE}/run`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(config),
      signal: controller.signal,
    });

    if (!r.ok) {
      let msg = `Server error (${r.status})`;
      try {
        const text = await r.text();
        const parsed = JSON.parse(text);
        msg = parsed.detail ?? parsed.message ?? text || msg;
      } catch {
        // keep status-code message
      }
      // Map common status codes to user-friendly messages
      if (r.status === 422) msg = `Invalid configuration: ${msg}`;
      else if (r.status === 500) msg = 'The simulation server encountered an error. Try again.';
      else if (r.status === 503) msg = 'Server is unavailable. Try again in a moment.';
      throw new Error(msg);
    }

    const data = await r.json();
    // Validate minimum shape before returning — guards against partial/malformed responses
    if (!data || !Array.isArray(data.rounds) || !Array.isArray(data.leaderboard)) {
      throw new Error('Received an unexpected response from the server.');
    }
    return data as SessionResult;
  } catch (err: any) {
    if (err?.name === 'AbortError') {
      throw new Error('Request timed out — the server took too long to respond. Try again.');
    }
    if (err?.message?.startsWith('Could not reach')) throw err;
    if (err?.message?.startsWith('Request timed out')) throw err;
    // Re-throw our own typed errors
    if (err instanceof Error) throw err;
    throw new Error('An unexpected error occurred. Try again.');
  } finally {
    clearTimeout(timer);
    if (activeRunController === controller) {
      activeRunController = null;
    }
  }
}
