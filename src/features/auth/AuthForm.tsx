'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { Button } from '@/components/ui/Button';
import type { AuthActionState } from '@/app/(auth)/actions';

function SubmitButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" size="lg" fullWidth disabled={pending}>
      {pending ? 'Please wait…' : label}
    </Button>
  );
}

const fieldClass =
  'min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base text-ink placeholder:text-ink-muted focus:border-brand focus:outline-none';

export function AuthForm({
  mode,
  action,
  title,
  subtitle,
}: {
  mode: 'login' | 'register';
  action: (state: AuthActionState, formData: FormData) => Promise<AuthActionState>;
  title: string;
  subtitle: string;
}) {
  const [state, formAction] = useActionState(action, {});

  return (
    <form action={formAction} className="space-y-4">
      <div className="text-left">
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-ink-muted">{subtitle}</p>
      </div>

      {mode === 'register' ? (
        <label className="block">
          <span className="mb-1 block text-sm font-medium">Username</span>
          <input
            name="username"
            type="text"
            autoComplete="username"
            placeholder="Optional"
            className={fieldClass}
          />
        </label>
      ) : null}

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Email</span>
        <input
          name="email"
          type="email"
          required
          autoComplete="email"
          inputMode="email"
          placeholder="you@example.com"
          className={fieldClass}
        />
      </label>

      <label className="block">
        <span className="mb-1 block text-sm font-medium">Password</span>
        <input
          name="password"
          type="password"
          required
          minLength={8}
          autoComplete={mode === 'login' ? 'current-password' : 'new-password'}
          placeholder="At least 8 characters"
          className={fieldClass}
        />
      </label>

      {state.error ? (
        <p
          role="alert"
          className="rounded-xl border border-hard/40 bg-hard/10 px-3 py-2 text-sm text-hard"
        >
          {state.error}
        </p>
      ) : null}
      {state.message ? (
        <p
          role="status"
          className="rounded-xl border border-brand/40 bg-brand/10 px-3 py-2 text-sm text-brand"
        >
          {state.message}
        </p>
      ) : null}

      <SubmitButton label={mode === 'login' ? 'Sign in' : 'Create account'} />
    </form>
  );
}