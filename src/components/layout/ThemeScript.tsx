'use client';

import { useEffect } from 'react';
import { useTheme } from '@/hooks/useTheme';

export default function ThemeScript() {
  const [, , ready] = useTheme();

  useEffect(() => {
    // Registers the PWA service worker (Phase 6 replaces this with a full
    // offline-first implementation; this keeps the app installable now).
    if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
      navigator.serviceWorker.register('/sw.js').catch(() => {
        // Registration failures are non-fatal: the app still works online.
      });
    }
  }, []);

  return <span hidden data-theme-ready={ready ? '1' : '0'} />;
}