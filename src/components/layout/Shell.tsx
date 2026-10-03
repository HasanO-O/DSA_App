import Link from 'next/link';
import { BottomNav } from './BottomNav';
import { cn } from '@/utils/cn';

/**
 * App shell for every signed-in screen.
 *
 * Mobile-first: single centred column capped at 3xl so lines stay readable on a
 * tablet/desktop, generous 44px+ touch targets, and bottom padding that clears
 * the fixed bottom navigation plus the iOS safe area.
 */
export function Shell({
  children,
  title,
  back,
  headerRight,
  withNav = true,
  className,
}: {
  children: React.ReactNode;
  title?: string;
  /** Renders a back link when provided. */
  back?: { href: string; label?: string };
  headerRight?: React.ReactNode;
  withNav?: boolean;
  className?: string;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      {title || back || headerRight ? (
        <header
          className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-sm"
          style={{ paddingTop: 'env(safe-area-inset-top)' }}
        >
          <div className="mx-auto flex min-h-14 w-full max-w-3xl items-center gap-2 px-3">
            {back ? (
              <Link
                href={back.href}
                aria-label={back.label ?? 'Back'}
                className="-ml-1 flex min-h-11 min-w-11 items-center justify-center rounded-lg text-lg text-ink-muted active:bg-surface-2"
              >
                <span aria-hidden>←</span>
              </Link>
            ) : null}
            {title ? (
              <h1 className="min-w-0 flex-1 truncate text-base font-semibold">{title}</h1>
            ) : (
              <span className="flex-1" />
            )}
            {headerRight}
          </div>
        </header>
      ) : null}

      <main
        className={cn(
          'mx-auto w-full max-w-3xl flex-1 px-4 py-4',
          withNav && 'pb-[calc(4.5rem+env(safe-area-inset-bottom))]',
          className,
        )}
      >
        {children}
      </main>

      {withNav ? <BottomNav /> : null}
    </div>
  );
}