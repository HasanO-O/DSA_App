import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthFooterLink } from '../layout';
import { AuthForm } from '@/features/auth/AuthForm';
import { signIn } from '../actions';
import { getCurrentUserId } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Sign in' };

export default async function LoginPage() {
  if (await getCurrentUserId()) redirect('/');

  return (
    <>
      <AuthForm
        mode="login"
        action={signIn}
        title="Welcome back"
        subtitle="Sign in to sync your drafts, diagrams and progress."
      />
      <AuthFooterLink href="/register">New here?</AuthFooterLink>
    </>
  );
}