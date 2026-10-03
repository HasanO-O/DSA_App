import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { AuthFooterLink } from '../layout';
import { AuthForm } from '@/features/auth/AuthForm';
import { signUp } from '../actions';
import { getCurrentUserId } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Create account' };

export default async function RegisterPage() {
  if (await getCurrentUserId()) redirect('/');

  return (
    <>
      <AuthForm
        mode="register"
        action={signUp}
        title="Create your account"
        subtitle="Required once — after that the app works offline."
      />
      <AuthFooterLink href="/login">Already have an account?</AuthFooterLink>
    </>
  );
}