'use client';

import { useMemo, useState } from 'react';
import { applyFilters, countProblems, type StatusFilter } from './filters';
import { ProblemList } from './ProblemList';
import type { ProblemBrowserData } from './browser-data';
import { cn } from '@/utils/cn';
import type { Difficulty } from '@/types/problem';

const STATUS_OPTIONS: { value: StatusFilter; label: string }[] = [
  { value: 'ALL', label: 'All' },
  { value: 'UNSOLVED', label: 'Unsolved' },
  { value: 'ATTEMPTED', label: 'Attempted' },
  { value: 'SOLVED', label: 'Solved' },
  { value: 'REVIEW', label: 'Review' },
];

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      aria-pressed={active}
      onClick={onClick}
      className={cn(
        'min-h-9 shrink-0 rounded-full border px-3 text-xs font-medium transition-colors',
        active
          ? 'border-brand bg-brand-soft text-brand'
          : 'border-line bg-surface text-ink-muted',
      )}
    >
      {children}
    </button>
  );
}

function Select({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="relative flex-1">
      <span className="sr-only">{label}</span>
      <select
        aria-label={label}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-10 w-full appearance-none rounded-xl border border-line bg-surface px-3 pr-8 text-xs text-ink focus:border-brand focus:outline-none"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <span aria-hidden className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-xs text-ink-muted">
        ▾
      </span>
    </label>
  );
}

/**
 * NeetCode-roadmap problem browser with client-side filters.
 * Filters are deliberately chips/selects rather than a sheet so the list stays
 * visible on a narrow viewport.
 */
export function ProblemFilters({ data }: { data: ProblemBrowserData }) {
  const [category, setCategory] = useState<string | null>(null);
  const [pattern, setPattern] = useState<string | null>(null);
  const [difficulty, setDifficulty] = useState<Difficulty | null>(null);
  const [status, setStatus] = useState<StatusFilter>('ALL');
  const [query, setQuery] = useState('');

  const filtered = useMemo(
    () => applyFilters(data.sections, { category, pattern, difficulty, status, query }),
    [data.sections, category, pattern, difficulty, status, query],
  );

  const visibleCount = filtered.reduce((sum, section) => sum + section.problems.length, 0);
  const hasFilters = Boolean(category || pattern || difficulty || status !== 'ALL' || query);

  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <label className="block">
          <span className="sr-only">Search problems</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search problems…"
            className="min-h-11 w-full rounded-xl border border-line bg-surface px-3 text-base placeholder:text-ink-muted focus:border-brand focus:outline-none"
          />
        </label>

        <div className="no-scrollbar -mx-1 flex gap-1.5 overflow-x-auto px-1 pb-1">
          {STATUS_OPTIONS.map((option) => (
            <FilterChip
              key={option.value}
              active={status === option.value}
              onClick={() => setStatus(option.value)}
            >
              {option.label}
            </FilterChip>
          ))}
        </div>

        <div className="flex gap-2">
          <Select
            label="Category"
            value={category ?? ''}
            onChange={(value) => setCategory(value || null)}
            options={[{ value: '', label: 'All categories' }, ...data.categories.map((c) => ({ value: c, label: c }))]}
          />
          <Select
            label="Pattern"
            value={pattern ?? ''}
            onChange={(value) => setPattern(value || null)}
            options={[{ value: '', label: 'All patterns' }, ...data.patterns.map((p) => ({ value: p, label: p }))]}
          />
          <Select
            label="Difficulty"
            value={difficulty ?? ''}
            onChange={(value) => setDifficulty((value || null) as Difficulty | null)}
            options={[
              { value: '', label: 'All' },
              ...data.difficulties.map((d) => ({ value: d, label: d.charAt(0) + d.slice(1).toLowerCase() })),
            ]}
          />
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-ink-muted">
        <span>
          {visibleCount} of {data.total} problems
        </span>
        {hasFilters ? (
          <button
            type="button"
            onClick={() => {
              setCategory(null);
              setPattern(null);
              setDifficulty(null);
              setStatus('ALL');
              setQuery('');
            }}
            className="font-medium text-brand"
          >
            Clear filters
          </button>
        ) : null}
      </div>

      <ProblemList sections={filtered} />
    </div>
  );
}