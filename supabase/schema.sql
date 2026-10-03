-- DSA App — Supabase / Postgres schema
-- Apply with: supabase db push   (or paste into the SQL editor)
-- All user-owned tables have RLS enabled and are scoped by auth.uid().

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------
do $$ begin
  create type learning_status as enum (
    'NOT_STARTED','ATTEMPTED','SOLVED','SOLVED_WITH_HINT','NEEDS_REVIEW','MASTERED'
  );
exception when duplicate_object then null; end $$;

do $$ begin
  create type external_status as enum ('UNKNOWN','UNSOLVED','ATTEMPTED','SOLVED','ACCEPTED');
exception when duplicate_object then null; end $$;

do $$ begin
  create type submission_status as enum (
    'ACCEPTED','WRONG_ANSWER','RUNTIME_ERROR','COMPILE_ERROR','TIME_LIMIT_EXCEEDED','INTERNAL_ERROR'
  );
exception when duplicate_object then null; end $$;

-- ---------------------------------------------------------------------------
-- profiles
-- ---------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  username text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles_select_own" on public.profiles;
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);

drop policy if exists "profiles_update_own" on public.profiles;
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);

drop policy if exists "profiles_insert_own" on public.profiles;
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);

-- Auto-create a profile row on signup.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)))
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- problems / problem_tags (shared reference data)
-- ---------------------------------------------------------------------------
create table if not exists public.problems (
  id text primary key,
  leetcode_slug text not null unique,
  title text not null,
  difficulty text not null check (difficulty in ('EASY','MEDIUM','HARD')),
  category text not null,
  pattern text not null,
  neetcode_order integer not null,
  leetcode_url text not null,
  summary text,
  tags jsonb not null default '[]'::jsonb,
  entry_function text not null default 'solve',
  created_at timestamptz not null default now()
);

create index if not exists problems_neetcode_order_idx on public.problems (neetcode_order);
create index if not exists problems_category_idx on public.problems (category);
create index if not exists problems_pattern_idx on public.problems (pattern);

alter table public.problems enable row level security;

drop policy if exists "problems_read_authenticated" on public.problems;
create policy "problems_read_authenticated" on public.problems
  for select to authenticated using (true);

create table if not exists public.problem_tags (
  problem_id text not null references public.problems (id) on delete cascade,
  tag text not null,
  primary key (problem_id, tag)
);

alter table public.problem_tags enable row level security;
drop policy if exists "problem_tags_read_authenticated" on public.problem_tags;
create policy "problem_tags_read_authenticated" on public.problem_tags
  for select to authenticated using (true);

-- ---------------------------------------------------------------------------
-- test_cases
-- Public tests are readable by authenticated users. Hidden tests are NOT
-- readable by any authenticated role — only the service role can read them.
-- ---------------------------------------------------------------------------
create table if not exists public.test_cases (
  id text primary key,
  problem_id text not null references public.problems (id) on delete cascade,
  input jsonb not null,
  expected_output jsonb not null,
  is_public boolean not null default true
);

create index if not exists test_cases_problem_idx on public.test_cases (problem_id);

alter table public.test_cases enable row level security;

drop policy if exists "test_cases_read_public_authenticated" on public.test_cases;
create policy "test_cases_read_public_authenticated" on public.test_cases
  for select to authenticated using (is_public = true);

-- ---------------------------------------------------------------------------
-- User-owned tables
-- ---------------------------------------------------------------------------
create table if not exists public.code_drafts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  language text not null,
  code text not null default '',
  version integer not null default 1,
  updated_at timestamptz not null default now(),
  unique (user_id, problem_id, language)
);

create index if not exists code_drafts_user_idx on public.code_drafts (user_id);
alter table public.code_drafts enable row level security;
drop policy if exists "code_drafts_own" on public.code_drafts;
create policy "code_drafts_own" on public.code_drafts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.submissions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  language text not null,
  source_code text not null,
  status submission_status not null,
  runtime_ms numeric,
  memory_kb numeric,
  passed_tests integer not null default 0,
  total_tests integer not null default 0,
  test_summary jsonb not null default '[]'::jsonb,
  compile_output text,
  stderr text,
  created_at timestamptz not null default now()
);

create index if not exists submissions_user_idx on public.submissions (user_id, created_at desc);
alter table public.submissions enable row level security;
drop policy if exists "submissions_own" on public.submissions;
create policy "submissions_own" on public.submissions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.problem_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  learning_status learning_status not null default 'NOT_STARTED',
  attempt_count integer not null default 0,
  successful_submission_count integer not null default 0,
  hints_used integer not null default 0,
  time_spent integer not null default 0,
  last_attempted_at timestamptz,
  last_solved_at timestamptz,
  last_reviewed_at timestamptz,
  external_status external_status not null default 'UNKNOWN',
  updated_at timestamptz not null default now(),
  unique (user_id, problem_id)
);

create index if not exists problem_progress_user_idx on public.problem_progress (user_id);
alter table public.problem_progress enable row level security;
drop policy if exists "problem_progress_own" on public.problem_progress;
create policy "problem_progress_own" on public.problem_progress for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.visualizations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  title text not null default 'Untitled',
  scene_data jsonb not null default '{"elements":[],"appState":{}}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists visualizations_user_problem_idx on public.visualizations (user_id, problem_id);
alter table public.visualizations enable row level security;
drop policy if exists "visualizations_own" on public.visualizations;
create policy "visualizations_own" on public.visualizations for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.notes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  body text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists notes_user_problem_idx on public.notes (user_id, problem_id);
alter table public.notes enable row level security;
drop policy if exists "notes_own" on public.notes;
create policy "notes_own" on public.notes for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.review_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  reason text not null default '',
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index if not exists review_items_user_idx on public.review_items (user_id, created_at desc);
alter table public.review_items enable row level security;
drop policy if exists "review_items_own" on public.review_items;
create policy "review_items_own" on public.review_items for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.commute_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  target_minutes integer not null,
  started_at timestamptz not null,
  ended_at timestamptz,
  time_spent integer not null default 0,
  problems_attempted integer not null default 0,
  problems_solved integer not null default 0,
  hints_used integer not null default 0
);

create index if not exists commute_sessions_user_idx on public.commute_sessions (user_id, started_at desc);
alter table public.commute_sessions enable row level security;
drop policy if exists "commute_sessions_own" on public.commute_sessions;
create policy "commute_sessions_own" on public.commute_sessions for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.commute_session_problems (
  session_id uuid not null references public.commute_sessions (id) on delete cascade,
  problem_id text not null references public.problems (id) on delete cascade,
  attempted boolean not null default false,
  solved boolean not null default false,
  primary key (session_id, problem_id)
);

alter table public.commute_session_problems enable row level security;
drop policy if exists "commute_session_problems_own" on public.commute_session_problems;
create policy "commute_session_problems_own" on public.commute_session_problems for all
  using (
    exists (
      select 1 from public.commute_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.commute_sessions s
      where s.id = session_id and s.user_id = auth.uid()
    )
  );

-- ---------------------------------------------------------------------------
-- sync_queue + external_accounts
-- ---------------------------------------------------------------------------
create table if not exists public.sync_queue (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  op_type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  synced_at timestamptz
);

create index if not exists sync_queue_user_idx on public.sync_queue (user_id, created_at);
alter table public.sync_queue enable row level security;
drop policy if exists "sync_queue_own" on public.sync_queue;
create policy "sync_queue_own" on public.sync_queue for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);

create table if not exists public.external_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  provider text not null,
  external_id text,
  external_status_map jsonb not null default '{}'::jsonb,
  last_synced_at timestamptz,
  created_at timestamptz not null default now(),
  unique (user_id, provider)
);

alter table public.external_accounts enable row level security;
drop policy if exists "external_accounts_own" on public.external_accounts;
create policy "external_accounts_own" on public.external_accounts for all
  using (auth.uid() = user_id) with check (auth.uid() = user_id);