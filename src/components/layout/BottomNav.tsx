'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/utils/cn';

export const NAV_ITEMS = [
  { href: '/', label: 'Home', glyph: '⌂' },
  { href: '/problems', label: 'Problems', glyph: '▤' },
  { href: '/review', label: 'Review', glyph: '↻' },
  { href: '/commute', label: 'Commute', glyph: '◷' },
  { href: '/profile', label: 'Profile', glyph: '☺' },
] as const;

function isActive(pathname: string, href: string): boolean {
  if (href === '/') return pathname === '/';
  return pathname === href || pathname.startsWith(`${href}/`);
}

/**
 * Fixed bottom navigation. Mobile-first: 5 items, >=56px tall, with a safe-area
 * inset so it clears the iOS home indicator.
 */
export function BottomNav() {
  const pathname = usePathname() ?? '/';

  return (
    <nav
      aria-label="Primary"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-surface/95 backdrop-blur-sm"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <ul className="mx-auto flex max-w-3xl items-stretch">
        {NAV_ITEMS.map((item) => {
          const active = isActive(pathname, item.href);
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={cn(
                  'flex min-h-14 flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
                  active ? 'text-brand' : 'text-ink-muted',
                )}
              >
                <span aria-hidden className="text-base leading-none">
                  {item.glyph}
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}