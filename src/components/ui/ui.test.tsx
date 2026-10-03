import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Badge, DifficultyBadge } from '@/components/ui/Badge';
import { Tabs } from '@/components/ui/Tabs';
import { SaveStatus } from '@/components/ui/SaveStatus';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { BottomNav, NAV_ITEMS } from '@/components/layout/BottomNav';
import { withEntryFunction } from '@/features/problems/CodeTab';

// next/navigation is not available in a component test environment.
vi.mock('next/navigation', () => ({
  usePathname: () => '/problems',
  useRouter: () => ({ push: vi.fn(), replace: vi.fn() }),
}));

describe('Button', () => {
  it('renders and defaults to type="button"', () => {
    render(<Button>Run</Button>);
    const button = screen.getByRole('button', { name: 'Run' });
    expect(button).toHaveAttribute('type', 'button');
  });

  it('can submit a form when asked', () => {
    render(<Button type="submit">Save</Button>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('disables when requested', () => {
    render(<Button disabled>Run</Button>);
    expect(screen.getByRole('button', { name: 'Run' })).toBeDisabled();
  });
});

describe('Badge', () => {
  it('renders difficulty labels', () => {
    render(<DifficultyBadge difficulty="EASY" />);
    expect(screen.getByText('Easy')).toBeInTheDocument();
  });

  it('renders every difficulty without crashing', () => {
    for (const difficulty of ['EASY', 'MEDIUM', 'HARD'] as const) {
      const { unmount } = render(<DifficultyBadge difficulty={difficulty} />);
      unmount();
    }
  });
});

describe('Tabs', () => {
  const items: { value: 'problem' | 'visualize' | 'code' | 'notes'; label: string }[] = [
    { value: 'problem', label: 'Problem' },
    { value: 'visualize', label: 'Visualize' },
    { value: 'code', label: 'Code' },
    { value: 'notes', label: 'Notes' },
  ];

  it('exposes a tablist with the supplied aria-label', () => {
    render(<Tabs ariaLabel="Workspace sections" items={items} value="problem" onChange={() => {}} />);
    expect(screen.getByRole('tablist', { name: 'Workspace sections' })).toBeInTheDocument();
  });

  it('marks only the active tab as selected', () => {
    render(<Tabs ariaLabel="Sections" items={items} value="code" onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Code' })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('tab', { name: 'Problem' })).toHaveAttribute('aria-selected', 'false');
  });

  it('calls onChange when a tab is pressed', async () => {
    let selected = 'problem';
    const { rerender } = render(
      <Tabs ariaLabel="Sections" items={items} value={selected} onChange={(v) => (selected = v)} />,
    );
    screen.getByRole('tab', { name: 'Notes' }).click();
    rerender(<Tabs ariaLabel="Sections" items={items} value={selected} onChange={() => {}} />);
    expect(screen.getByRole('tab', { name: 'Notes' })).toHaveAttribute('aria-selected', 'true');
  });
});

describe('SaveStatus', () => {
  it('shows Offline when there is no connection', () => {
    render(<SaveStatus state={{ online: false, pending: 3, syncing: false }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Offline');
  });

  it('shows Syncing while a save is in flight', () => {
    render(<SaveStatus state={{ online: true, pending: 0, syncing: true }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Syncing');
  });

  it('shows Saved when idle', () => {
    render(<SaveStatus state={{ online: true, pending: 0, syncing: false }} />);
    expect(screen.getByRole('status')).toHaveTextContent('Saved');
  });
});

describe('ProgressBar', () => {
  it('exposes the correct progressbar semantics', () => {
    render(<ProgressBar value={3} max={9} label="Arrays progress" />);
    const bar = screen.getByRole('progressbar', { name: 'Arrays progress' });
    expect(bar).toHaveAttribute('aria-valuenow', '3');
    expect(bar).toHaveAttribute('aria-valuemax', '9');
  });

  it('does not divide by zero', () => {
    render(<ProgressBar value={0} max={0} label="Empty" />);
    expect(screen.getByRole('progressbar', { name: 'Empty' })).toHaveAttribute('aria-valuenow', '0');
  });
});

describe('BottomNav', () => {
  it('renders all five primary destinations', () => {
    render(<BottomNav />);
    expect(NAV_ITEMS).toHaveLength(5);
    for (const item of NAV_ITEMS) {
      expect(screen.getByRole('link', { name: new RegExp(item.label) })).toBeInTheDocument();
    }
  });

  it('marks the current page', () => {
    render(<BottomNav />);
    expect(screen.getByRole('link', { name: /Problems/ })).toHaveAttribute('aria-current', 'page');
  });
});

describe('withEntryFunction', () => {
  it('rewrites the placeholder to the real entry point', () => {
    expect(withEntryFunction('fn solve() {}', 'twoSum')).toBe('fn twoSum() {}');
  });

  it('replaces every occurrence but leaves unrelated words alone', () => {
    expect(withEntryFunction('// solve the problem\nfn solve() {}', 'climbStairs')).toBe(
      '// solve the problem\nfn climbStairs() {}',
    );
  });
});