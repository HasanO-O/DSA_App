import Link from 'next/link';
import type { ReactNode } from 'react';
import { isSupabaseConfigured } from '@/lib/env';

export default function AuthLayout({ children }: { children: ReactNode }) {
  const configured = isSupabaseConfigured();

  return (
    <div className="flex min-h-dvh flex-col justify-center bg-canvas px-5 py-10">
      <div className="mx-auto w-full max-w-sm">
        <div className="mb-8 text-center">
          <div
            aria-hidden
            className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-2xl font-bold text-white"
          >
            ⌘
          </div>
          <h1 className="text-xl font-semibold">DSA Practice</h1>
          <p className="mt-1 text-sm text-ink-muted">
            Your NeetCode companion — visualize, code, and track progress offline.
          </p>
        </div>

        {children}

        {!configured ? (
          <p className="mt-6 rounded-xl border border-medium/40 bg-medium/10 px-3 py-2 text-xs text-medium">
            Supabase environment variables are missing. Copy <code>.env.example</code> to{' '}
            <code>.env.local</code>, fill it in, and restart the dev server.
          </p>
        ) : null}
      </div>
    </div>
  );
}

export function AuthFooterLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <p className="mt-6 text-center text-sm text-ink-muted">
      {children}{' '}
      <Link href={href} className="font-medium text-brand underline underline-offset-4">
        {href === '/register' ? 'Create an account' : 'Sign in'}
      </Link>
    </p>
  );
}