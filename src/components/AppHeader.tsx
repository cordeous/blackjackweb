import type { ReactNode } from 'react';

interface Props {
  /** Slot rendered in the center of the header (round/phase info, hero title, etc.) */
  center?: ReactNode;
  /** Slot rendered on the right side (navigation buttons) */
  actions?: ReactNode;
}

/**
 * Shared top-navigation bar used across all views.
 * Logo is always on the left; center and actions are optional slots.
 */
export function AppHeader({ center, actions }: Props) {
  return (
    <header
      className="flex items-center justify-between px-3 md:px-14 h-14 md:h-[72px] flex-shrink-0"
      style={{ borderBottom: '1px solid var(--color-border)' }}
    >
      {/* Logo */}
      <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
        <div
          className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center text-base md:text-lg font-semibold flex-shrink-0"
          style={{ border: '1px solid var(--color-gold)', color: 'var(--color-gold)', fontFamily: 'Cormorant Garamond, serif' }}
          aria-hidden="true"
        >♠</div>
        <span className="text-xs md:text-sm font-medium tracking-[2px] md:tracking-[3px] text-white hidden sm:block">
          BLACKJACK AI
        </span>
      </div>

      {/* Center slot */}
      {center && (
        <div className="flex-1 flex justify-center px-4">
          {center}
        </div>
      )}

      {/* Actions slot */}
      {actions && (
        <div className="flex items-center gap-1.5 md:gap-2 flex-shrink-0">
          {actions}
        </div>
      )}
    </header>
  );
}
