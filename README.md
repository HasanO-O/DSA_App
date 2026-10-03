# DSA Practice — NeetCode Companion

A **mobile-first, offline-capable** web application for practicing DSA problems during fragmented
study sessions (train travel, commutes, short breaks).

It is deliberately **not** a LeetCode clone. LeetCode remains the source of problem identity and
statements; this app provides the learning workflow around them: a persistent Excalidraw
visualization workspace, a mobile-friendly code editor with drafts, and a learning-progress model
that is separate from "LeetCode solved".

---

## Current status

Phases are delivered **one at a time**, each brought to a usable, verified state.

| Phase | Scope | Status |
| --- | --- | --- |
| 0 | Next.js/TS foundation, Supabase abstraction, PWA skeleton, mobile shell, docs | ✅ done |
| 1 | Problem model, seed data, problem browser, problem workspace, filters | ✅ done |
| 2 | Excalidraw workspace, scene persistence, DSA templates | ✅ done |
| 3 | CodeMirror editor, language selection, mobile toolbar, local draft autosave | ✅ done |
| 4 | Code execution via Judge0 (`CodeExecutionService`) | ⏳ next |
| 5 | Learning progress, attempts, review queue, dashboard stats | ⏳ planned |
| 6 | Full offline/PWA caching and the idempotent sync queue | ⏳ planned |
| 7 | Deterministic NeetCode recommendation engine | ⏳ planned |
| 8 | Commute mode sessions and summaries | ⏳ planned |
| 9 | LeetCode integration behind `LeetCodeProvider` | ⏳ planned |
| 10 | AI assistance via OpenRouter | ⏳ planned |

See `AGENTS.md` for the engineering rules and the full phase plan.

---

## What works today

- **Sign in / register** with Supabase Auth. Every signed-in route is gated by middleware.
- **Problem browser** following the NeetCode roadmap, grouped by category, with filters for
  category, pattern, difficulty, status, review-required and free-text search.
- **One persistent workspace per problem** with tabs: **Problem · Visualize · Code · Notes**.
- **Visualize** — Excalidraw canvas with 8 DSA templates (Array, Linked List, Stack, Queue, Tree,
  Graph, Hash Map, Pointer). Scenes persist as structured JSON and autosave to IndexedDB.
- **Code** — CodeMirror 6 with 5 languages, a mobile symbol toolbar, and per-`problem + language`
  draft autosave to IndexedDB.
- **Notes** — autosaving free-form notes per problem.
- **Dashboard, Review, Commute, Profile** shells with real roadmap data.
- **PWA** — installable manifest + service worker skeleton.

Code execution and AI buttons are present but **disabled with an explanation**, because their
services land in later phases.

---

## Tech stack

| Concern | Choice |
| --- | --- |
| Framework | Next.js (App Router) + React + TypeScript |
| Styling | Tailwind CSS v4 (mobile-first, dark mode via `.dark` class) |
| Backend | Next.js route handlers + server actions |
| Database | Supabase (PostgreSQL) with Row Level Security |
| Auth | Supabase Auth (session-cookie based, refreshed by middleware) |
| Local storage | IndexedDB via Dexie |
| Visualization | `@excalidraw/excalidraw` |
| Editor | CodeMirror 6 |
| Validation | Zod at API boundaries |
| Testing | Vitest + React Testing Library (unit/component), Playwright (E2E) |

---

## Getting started

### 1. Install

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Fill in at minimum:

```dotenv
NEXT_PUBLIC_SUPABASE_URL=https://<project>.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<anon key>
SUPABASE_SERVICE_ROLE_KEY=<service role key>   # server only
```

`JUDGE0_*` and `OPENROUTER_*` are only needed for Phases 4 and 10.

### 3. Create the database

Run `supabase/schema.sql` in the Supabase SQL editor (or `supabase db push`). It creates all tables,
indexes, RLS policies, and the `on_auth_user_created` trigger that provisions a `profiles` row.

> **This step is required before the seeded cloud data exists.** Until it is applied,
> `POST /api/dev/seed` fails with `Could not find the table 'public.problems' in the schema cache`,
> and the app falls back to the bundled seed dataset (which works, but keeps nothing server-side).

### 4. Seed the problems

With `SUPABASE_SERVICE_ROLE_KEY` set and the schema applied:

```bash
curl -X POST http://localhost:3000/api/dev/seed
```

This upserts the bundled problems and their **public** test cases. The route refuses to run in
production, and can additionally require an `x-seed-secret` header when `SEED_SECRET` is set.

> The app also works **without** seeding: the same dataset is bundled in
> `src/lib/problems/seed.ts` and used as a fallback whenever Supabase has no rows.

### 5. Run

```bash
npm run dev
```

Open http://localhost:3000, create an account, and start practising.

---

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the dev server |
| `npm run build` | Production build |
| `npm start` | Run the production build |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint (flat config) |
| `npm run test` | Vitest unit + component tests |
| `npm run test:watch` | Vitest in watch mode |
| `npm run test:e2e` | Playwright end-to-end tests (Pixel 5 viewport) |
| `npm run format` | Prettier |

> **Windows note:** if PowerShell blocks `npm` with *"running scripts is disabled on this system"*,
> use `npm.cmd` instead (e.g. `npm.cmd run dev`). This is an execution-policy issue, not a project one.

---

## Architecture

```
src/
  app/
    (auth)/        login, register, auth server actions
    (main)/        signed-in screens: dashboard, problems, review, commute, profile
      problems/[slug]/   one persistent workspace per problem
    api/           route handlers
    manifest.ts    PWA manifest
  components/
    layout/        Shell, BottomNav
    ui/            Button, Card, Badge, Tabs, ProgressBar, SaveStatus, Spinner
  features/
    problems/      browser, filters, workspace tabs
    editor/        CodeMirror wrapper, mobile toolbar
    visualization/ Excalidraw workspace, DSA templates
    progress/      progress service
    commute/       commute data
    auth/          auth form
  lib/
    supabase/      client, server, admin (service role), middleware
    db/            Dexie schema, draft repository
    problems/      seed dataset, repository
    env.ts         validated environment access
  types/           shared domain types + Zod schemas
  utils/           formatting, ids, class names
```

### Key boundaries

- **No user code ever runs inside Next.js.** Execution goes through an isolated Judge0 service
  (Phase 4). UI components must call `CodeExecutionService`, never the provider directly.
- **Secrets stay server-side.** `SUPABASE_SERVICE_ROLE_KEY`, `JUDGE0_API_KEY` and
  `OPENROUTER_API_KEY` are read only in server modules (`admin.ts`, judge, AI).
- **Third-party providers sit behind interfaces** (`Judge0Provider`, `AIProvider`,
  `LeetCodeProvider`), so the UI never couples to a specific vendor.
- **Local-first writes.** Drafts, notes and diagrams are written to IndexedDB first and synced
  later, so an offline session behaves like an online one.
- **RLS everywhere.** Every user-owned table is scoped to `auth.uid()`.

### Request gating

`src/proxy.ts` refreshes the Supabase session cookie and redirects signed-out users to `/login` —
but it **deliberately exempts `/api/*`**. Redirecting an API call to an HTML login page returns
`200 text/html`, which `fetch()` callers silently treat as success. Each route handler therefore
checks the session itself and returns a JSON `401`.

### Pure logic vs. server loaders

Modules that reach for the Supabase server client are marked `server-only` and cannot be imported
by a Client Component or a unit test. Filter/state logic that also needs to run in the browser
(`src/features/problems/filters.ts`) is kept free of server imports so it stays directly testable.

### Content policy

Problem metadata (title, slug, difficulty, category, pattern, NeetCode order, URL) is stored
locally. Problem `summary` text is **original copy written for this app** — no LeetCode statements
are scraped or republished. Full statements are reached through the external LeetCode link.

---

## Known limitations

- Code execution, submissions and the judge harness are not implemented (Phase 4).
- Learning-progress writes and the review queue are read-only today (Phase 5).
- The service worker only precaches the shell; problems/drafts are not yet cached for offline use
  (Phase 6).
- The recommendation engine is a simple deterministic ordering, not the full explainable
  `RecommendationService` (Phase 7).
- Commute sessions are a selection surface only (Phase 8).
- LeetCode and AI integrations are not implemented (Phases 9–10).

---

## License

Private project. Problem metadata is derived from publicly available titles/URLs; all summaries are
original.