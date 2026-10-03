'use client';

import { useEffect, useRef, useState } from 'react';
import { cn } from '@/utils/cn';

export interface TabItem<T extends string> {
  value: T;
  label: string;
  /** Short glyph shown under the label on very narrow screens. */
  glyph?: string;
}

/**
 * Horizontally scrollable segmented control. Kept as tabs rather than a route
 * change per tab so moving between Visualize / Code / Notes does not reload the
 * whole workspace on a phone.
 */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
  ariaLabel,
}: {
  items: readonly TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  ariaLabel: string;
}) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const [canScroll, setCanScroll] = useState(false);

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    const update = () => setCanScroll(el.scrollWidth > el.clientWidth + 4);
    update();
    el.addEventListener('scroll', update, { passive: true });
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => {
      el.removeEventListener('scroll', update);
      observer.disconnect();
    };
  }, [items.length]);

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        'no-scrollbar flex gap-1 overflow-x-auto border-b border-line px-1',
        className,
      )}
      ref={scrollerRef}
    >
      {items.map((item) => {
        const selected = item.value === value;
        return (
          <button
            key={item.value}
            role="tab"
            type="button"
            aria-selected={selected}
            onClick={() => onChange(item.value)}
            className={cn(
              'relative flex min-h-11 shrink-0 items-center gap-1.5 px-3 text-sm font-medium transition-colors',
              selected ? 'text-brand' : 'text-ink-muted active:text-ink',
            )}
          >
            {item.glyph ? (
              <span aria-hidden className="text-[13px] leading-none">
                {item.glyph}
              </span>
            ) : null}
            {item.label}
            <span
              aria-hidden
              className={cn(
                'absolute inset-x-2 -bottom-px h-0.5 rounded-full transition-opacity',
                selected ? 'bg-brand opacity-100' : 'opacity-0',
              )}
            />
          </button>
        );
      })}
      {canScroll ? (
        <span aria-hidden className="pointer-events-none self-center pr-2 text-xs text-ink-muted">
          ›
        </span>
      ) : null}
    </div>
  );
}