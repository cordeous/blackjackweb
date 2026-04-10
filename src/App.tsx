import React from 'react';
import { SessionProvider, useSession } from './context/SessionContext';
import { MainMenuView }    from './views/MainMenuView';
import { GameView }        from './views/GameView';
import { LeaderboardView } from './views/LeaderboardView';

function LoadingView() {
  return (
    <div
      className="min-h-screen flex flex-col"
      role="status"
      aria-live="polite"
      aria-label="Simulating tournament"
      style={{ background: 'var(--color-page)' }}
    >
      {/* Header strip — matches AppHeader height so the page feels grounded */}
      <div
        className="flex items-center gap-2 md:gap-3 px-3 md:px-14 flex-shrink-0"
        style={{ height: '72px', borderBottom: '1px solid var(--color-border)' }}
        aria-hidden="true"
      >
        <div
          className="w-9 h-9 flex items-center justify-center text-lg font-semibold"
          style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', fontFamily: 'Cormorant Garamond, serif' }}
        >♠</div>
        <span className="text-sm font-medium tracking-[3px] hidden sm:block" style={{ color: 'var(--color-text-primary)' }}>BLACKJACK AI</span>
      </div>

      {/* Center stage */}
      <div className="flex-1 flex flex-col items-center justify-center gap-8 px-6 text-center">
        {/* Suit row — decorative, evokes a card table */}
        <div
          className="flex items-center gap-6 select-none text-3xl md:text-4xl"
          aria-hidden="true"
          style={{ color: 'var(--color-gold)', opacity: 0.25 }}
        >
          <span>♠</span><span>♥</span><span>♣</span><span>♦</span>
        </div>

        {/* Primary message */}
        <div className="flex flex-col items-center gap-2">
          <h1
            className="text-3xl md:text-4xl font-medium"
            style={{ fontFamily: 'Cormorant Garamond, serif', color: 'var(--color-text-primary)' }}
          >
            Dealing the Tournament
          </h1>
          <p className="text-xs md:text-sm tracking-[2px]" style={{ color: 'var(--color-text-secondary)' }}>
            RUNNING ALL AGENTS AGAINST THE DEALER
          </p>
        </div>

        {/* Spinner — thin, gold, feels like a roulette wheel */}
        <div
          className="w-10 h-10"
          aria-hidden="true"
          style={{
            border: '1px solid var(--color-gold-dim)',
            borderTopColor: 'var(--color-gold)',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
          }}
        />
      </div>
    </div>
  );
}

/** Catches unexpected render errors and shows a recovery screen instead of a blank page. */
class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { error: Error | null }
> {
  state = { error: null };
  private alertRef = React.createRef<HTMLDivElement>();

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidUpdate(_: unknown, prevState: { error: Error | null }) {
    // Move focus to the alert container when an error first appears
    if (!prevState.error && this.state.error && this.alertRef.current) {
      this.alertRef.current.focus();
    }
  }

  render() {
    if (this.state.error) {
      return (
        <div
          ref={this.alertRef}
          tabIndex={-1}
          className="min-h-screen flex flex-col items-center justify-center gap-4 px-6 text-center"
          role="alert"
          style={{ background: 'var(--color-page)', outline: 'none' }}
        >
          <div className="text-4xl" aria-hidden="true" style={{ color: 'var(--color-loss)' }}>⚠</div>
          <h1 className="text-lg font-semibold" style={{ color: 'var(--color-text-primary)' }}>Something went wrong</h1>
          <p className="text-sm max-w-sm" style={{ color: 'var(--color-text-secondary)' }}>
            An unexpected error occurred. Reload the page to start over.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-2 px-6 py-2 text-sm font-semibold"
            style={{ background: 'var(--color-gold)', color: 'var(--color-page)' }}
          >
            Reload Page
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function AppInner() {
  const { state } = useSession();

  return (
    <div className="min-h-screen" style={{ background: 'var(--color-page)' }}>
      {state.view === 'menu'        && <MainMenuView />}
      {state.view === 'loading'     && <LoadingView />}
      {state.view === 'game'        && state.session && <GameView />}
      {state.view === 'leaderboard' && state.session && <LeaderboardView />}
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <SessionProvider>
        <AppInner />
      </SessionProvider>
    </ErrorBoundary>
  );
}
