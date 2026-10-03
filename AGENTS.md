# AGENTS.md — Engineering Rules

These rules govern every change to this repository. Read them before writing code.

## Workflow

1. **Inspect the repository before changing files.** Search before you add; reuse what exists.
2. Implement the **smallest complete version** of a task. No speculative abstractions.
3. Run `npm run typecheck`, then `npm run lint`, then `npm run test`. Fix what they report.
4. Update the docs when behaviour or architecture changes.
5. Report concisely: files changed, functionality added, tests run, known limitations, next task.

## Phase discipline

Phases are delivered **one at a time**, each finished and verified before the next begins.

Current: **Phase 4 — code execution.** Phases 0–3 are complete.

Do **not** start AI or LeetCode account synchronization before Phase 4 is verified. Do not
implement several unrelated phases at once.

## Hard rules

These are non-negotiable and are checked in review.

1. **Never execute user code inside the Next.js process.** Execution goes through an isolated
   service (Judge0). No `eval`, no `Function()`, no `child_process` running submissions.
2. **Never put secrets in client code.** `SUPABASE_SERVICE_ROLE_KEY`, `JUDGE0_API_KEY`,
   `OPENROUTER_API_KEY` are server-only. `admin.ts` imports `server-only`.
3. **Never store or request LeetCode credentials.** No password, no cookie, no session token.
   Do not build the product around undocumented scraping.
4. **Never expose hidden test cases to the client.** They are loaded with the service-role client
   on the server only. RLS on `test_cases` permits `is_public = true` to authenticated users.
5. **Never trust client-provided results.** Test results, progress values and timings are
   recomputed server-side from the judge's response.
6. **Never use AI output as proof of correctness.** Correctness comes from the judge. Render
   `Judge: Accepted` and `AI Review: …` as separate, clearly labelled facts.
7. **Third-party providers stay behind interfaces.** UI code must not import `judge0.ts`,
   `openrouter.ts` or a LeetCode provider directly.
8. **Row Level Security on every user-owned table**, scoped to `auth.uid()`. A user may only read
   their own code, diagrams, notes, submissions and progress.
9. **Preserve user work.** Never overwrite a user's code, diagram, notes or progress with older
   data. Drafts use a version counter with last-write-wins that cannot discard newer local work.
10. **Do not silently change the database schema.** Schema changes ship as a migration and are
    mirrored in `supabase/schema.sql`.

## Code conventions

- TypeScript `strict` with `noUncheckedIndexedAccess`. No `any` in committed code
  (`@typescript-eslint/no-explicit-any` is a warning — do not introduce new ones).
- Validate every external boundary with Zod: API routes, Supabase rows, AI responses.
- Server-only modules start with `import 'server-only';`.
- Tailwind utility classes; `cn()` from `@/utils/cn` for conditional class composition.
- Mobile first. Every interactive target is at least 44px tall.
- Comments explain **why**, not what. Do not narrate obvious code.

## Testing

- Unit tests for core utilities and business logic (`deriveLearningStatus`,
  `applyFilters`, `buildTemplate`, the judge harness, the sync manager).
- Component tests for critical UI behaviour.
- E2E (Playwright, Pixel 5 viewport) for the main practice workflow in the spec's definition of
  done: open app → pick a problem → read → visualize → insert a template → leave and reopen →
  diagram persists → code → close → reopen → draft persists.
- Add a test for important business logic. A change to a pure function without a test is
  incomplete.

## Scope limits

Do **not** implement, even if it seems useful:

social features, friends, leaderboards, public profiles, chat, a full LeetCode clone, video
hosting, an AI-generated visualization engine, automatic code instrumentation, complex
spaced-repetition algorithms, microservices, custom code-execution infrastructure, a native mobile
app, or a rewrite in Rust.

Rust may be introduced later only with a concrete technical reason (code analysis, high-performance
simulation, background processing) — not for its own sake.

## Content policy

Store only problem metadata (title, slug, difficulty, category, pattern, NeetCode order, URL).
Problem `summary` copy must be original. Never scrape or republish LeetCode's statements or
examples; link out instead. Identify problems by `leetcode_slug`, never by title.

## Definition of done (MVP)

A user can: open the app → select a NeetCode problem → read it → open visualization → insert an
Array/Linked List template → modify it → close → reopen and see the diagram → open Code → write
Rust/Python/C++ → close the app or go offline → reopen and see the draft → reconnect → run the code
→ get a test result → save a submission → update learning status → see the dashboard update.

That flow matters more than having 150 problems.

<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
