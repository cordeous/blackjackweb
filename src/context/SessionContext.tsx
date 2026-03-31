import React, { createContext, useContext, useReducer, type ReactNode } from 'react';
import type { SessionResult, RunConfig } from '../types/session';

// ---------------------------------------------------------------------------
// State
// ---------------------------------------------------------------------------

export type View = 'menu' | 'loading' | 'game' | 'leaderboard';

export interface AppState {
  view:    View;
  config:  RunConfig;
  session: SessionResult | null;
  error:   string | null;
}

const DEFAULT_CONFIG: RunConfig = {
  agents:            ['Random', 'Heuristic(basic)', 'Heuristic(aggressive)', 'MCTS'],
  num_rounds:        20,
  base_bet:          10,
  starting_bankroll: 1000,
  seed:              42,
  mcts_sims:         200,
  dnn_model_path:    'models/blackjack_mlp.pt',
};

const initialState: AppState = {
  view:    'menu',
  config:  DEFAULT_CONFIG,
  session: null,
  error:   null,
};

// ---------------------------------------------------------------------------
// Actions
// ---------------------------------------------------------------------------

type Action =
  | { type: 'SET_CONFIG'; config: Partial<RunConfig> }
  | { type: 'START_LOADING' }
  | { type: 'SESSION_LOADED'; session: SessionResult }
  | { type: 'SESSION_ERROR'; error: string }
  | { type: 'GO_TO_GAME' }
  | { type: 'GO_TO_LEADERBOARD' }
  | { type: 'GO_TO_MENU' };

function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_CONFIG':
      // Ignore config changes while a simulation is running
      if (state.view === 'loading') return state;
      return { ...state, config: { ...state.config, ...action.config } };
    case 'START_LOADING':
      // Prevent re-entering loading state if already loading (double-submit guard)
      if (state.view === 'loading') return state;
      return { ...state, view: 'loading', error: null };
    case 'SESSION_LOADED':
      // Only accept a result if we're still in the loading state (ignore stale responses)
      if (state.view !== 'loading') return state;
      return { ...state, session: action.session, view: 'game', error: null };
    case 'SESSION_ERROR':
      return { ...state, view: 'menu', error: action.error };
    case 'GO_TO_GAME':
      if (!state.session) return state;
      return { ...state, view: 'game' };
    case 'GO_TO_LEADERBOARD':
      if (!state.session) return state;
      return { ...state, view: 'leaderboard' };
    case 'GO_TO_MENU':
      return { ...state, view: 'menu', session: null, error: null };
    default:
      return state;
  }
}

// ---------------------------------------------------------------------------
// Context
// ---------------------------------------------------------------------------

interface SessionContextValue {
  state: AppState;
  dispatch: React.Dispatch<Action>;
}

const SessionContext = createContext<SessionContextValue | null>(null);

export function SessionProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  return (
    <SessionContext.Provider value={{ state, dispatch }}>
      {children}
    </SessionContext.Provider>
  );
}

export function useSession(): SessionContextValue {
  const ctx = useContext(SessionContext);
  if (!ctx) throw new Error('useSession must be used within SessionProvider');
  return ctx;
}
