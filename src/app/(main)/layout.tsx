import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { Shell } from '@/components/layout/Shell';
import ThemeScript from "@/components/layout/ThemeScript"
import { getCurrentUserId } from '@/lib/supabase/server';

export const metadata: Metadata = { title: 'Today' };

/**
 * Signed-in shell. Every screen inside this group renders with the bottom
 * navigation and is gated by the middleware session check.
 */
export default async function MainLayout({ children }: { children: React.ReactNode }) {
  const userId = await getCurrentUserId();
  if (!userId) redirect('/login');

  return (
    <>
      <ThemeScript />
      <Shell withNav>{children}</Shell>
    </>
  );
}