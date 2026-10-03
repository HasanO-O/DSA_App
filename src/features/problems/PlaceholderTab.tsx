'use client';

import { Card, EmptyState, SectionHeading } from '@/components/ui/Card';
import { SaveStatus } from '@/components/ui/SaveStatus';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import type { Problem } from '@/types/problem';

export function PlaceholderTab({ feature, problem }: { feature: string; problem: Problem }) {
  const online = useOnlineStatus();

  return (
    <div className="space-y-4">
      <SectionHeading title={feature} action={<SaveStatus state={{ online, pending: 0, syncing: false }} />} />
      <EmptyState
        title={`${feature} arrives in a later phase`}
        description={`Nothing is lost — your ${problem.title} workspace, code and diagrams are already saved locally.`}
      />
    </div>
  );
}