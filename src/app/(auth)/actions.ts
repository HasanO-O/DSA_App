'use server';

import { redirect } from 'next/navigation';
import { z } from 'zod';
import { createServerSupabaseClient } from '@/lib/supabase/server';

const credentialsSchema = z.object({
  email: z.string().email('Enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  username: z.string().min(1).max(40).optional(),
});

export interface AuthActionState {
  error?: string;
  message?: string;
}

export async function signIn(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid credentials' };
  }

  const { client, missingConfig } = await createServerSupabaseClient();
  if (missingConfig || !client) {
    return { error: 'Supabase is not configured. Add the keys to .env.local and restart.' };
  }

  const { error } = await client.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) return { error: error.message };

  redirect('/');
}

export async function signUp(
  _prev: AuthActionState,
  formData: FormData,
): Promise<AuthActionState> {
  const parsed = credentialsSchema.safeParse({
    email: formData.get('email'),
    password: formData.get('password'),
    username: formData.get('username') || undefined,
  });

  if (!parsed.success) {
    return { error: parsed.error.issues[0]?.message ?? 'Invalid details' };
  }

  const { client, missingConfig } = await createServerSupabaseClient();
  if (missingConfig || !client) {
    return { error: 'Supabase is not configured. Add the keys to .env.local and restart.' };
  }

  const { error } = await client.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: { username: parsed.data.username ?? parsed.data.email.split('@')[0] },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}`,
    },
  });

  if (error) return { error: error.message };

  // With email confirmation disabled the session is already active.
  const { data } = await client.auth.getUser();
  if (data.user) redirect('/');

  return { message: 'Check your inbox to confirm your email, then sign in.' };
}

export async function signOut(): Promise<void> {
  const { client } = await createServerSupabaseClient();
  if (client) await client.auth.signOut();
  redirect('/login');
}