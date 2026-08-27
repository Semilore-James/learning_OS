# DA // LEARNING OS — Build Plan

The Council reviewed the full PRD for a **bulk build**: every feature ships
functional, no stubs. This is the blueprint and the ordered step list.

---

## Build model

**Frozen foundation, then parallel features, continuously integrated.**

`main` builds and deploys green after every feature merge. Incomplete features
hide behind flags (`app/lib/flags.ts`). There is no big-bang integration at the
end because integration happens continuously.

### The five frozen contracts (build first, then lock)

| Contract | Where | Why it must be frozen first |
|---|---|---|
| Database schema | `supabase/migrations/` | Six features write `heatmap_activity`; a rename later rewrites all six |
| Auth + session | `app/lib/auth`, Supabase Auth | Every feature reads "who is this, are they a guest" |
| State store + adapters | `app/lib/store.ts`, `app/lib/adapters/` | No component should know if localStorage or Supabase is live |
| Desktop shell + window manager | `app/components/desktop/`, `app/lib/useWindows.ts` | Every feature is a window inside this |
| Curriculum graph | `app/content/curriculum.ts`, `app/lib/graph.ts` | Constellation, drawer, textbook, review queue, diagnostic all read it |

---

## External integrations (each behind a typed adapter)

| Concern | Vendor (v1) | Gotcha the adapter absorbs |
|---|---|---|
| Auth, DB, storage | Supabase | Free tier pauses after 7 days idle, no backups. Go Pro (~$25/mo) before real users. |
| Transactional email | **Resend** free tier, wired as Supabase **custom SMTP** | Supabase's built-in email throttles at ~3/hour and kills OTP testing on day one. Non-negotiable, do it before building auth. |
| PM-AI | `Advisor` interface, Grok (xAI) free impl | No SLA, rate-limits. Submission is persisted to Postgres **before** the AI call, so a failure loses nothing. Provider swap = one file. |
| Analytics | PostHog, reverse-proxied through Next.js `rewrites` | Adblockers block the default domain. Session recording only on Constellation + Case Files (per PRD). |
| Video | YouTube Data API **at import time only**; iframe embed at runtime | 10k quota units/day. Never call the API at runtime; cache everything to `video_catalog`. |
| AI rate limiting | Upstash Redis free tier | One script shouldn't drain the LLM quota. |
| Errors | Sentry free tier | — |
| Cron | Vercel Cron -> Supabase query -> Resend | Daily streak-reminder email. |
| Hosting | Vercel hobby | 10s serverless ceiling. Stream the PM-AI response or move to Pro. |

**Monthly cost:** $0 to build and launch. $25–75/mo once real, swing line is the
AI (Grok free vs. ~$15/mo paid model). That one decision is deferred to launch
week — clean, because it is one file behind the `Advisor` interface.

---

## Additions accepted into the build

Beyond the PRD:

1. **Toolkit window** (desktop icon #10, the empty grid slot in the mockup).
   Every tool an analyst installs to practice — Excel, Google Sheets, PostgreSQL
   + DBeaver, SQL Server Express + SSMS, DB Browser for SQLite, Power BI Desktop,
   Tableau Public, Airtable, Python + VS Code, Git + GitHub, GitHub Desktop —
   each with: what it is, why the job needs it, official download link, install
   steps **per OS**, a verification step, and the problems people actually hit
   (Windows-only tools on Mac, PATH issues, forgotten Postgres password, GitHub
   PAT auth, CRLF line endings, etc.). Marking a tool installed feeds XP +
   heatmap. Data lives in `app/content/toolkit.ts` (seeded). Several
   constellation sub-nodes deep-link here.
2. **Git and Version Control track** — a full 11th constellation topic with 15
   sub-nodes (why version control, install + config, repos, staging, commits,
   history, `.gitignore` + secrets, branches, merging, conflicts, remotes +
   GitHub, push/pull/fetch, pull requests, undoing things, Git for analysts).
   Its own topic book (`git-for-analysts`). Defined in `curriculum.ts`.
3. **Spaced-repetition Review queue** + a `needs-review` node state. Closes the
   gap between the PRD and its own "drill, revisit, embed" philosophy — there was
   no revisit mechanism. Completed sub-nodes resurface on an expanding schedule;
   missing one resets the interval and flags the node on the map. SM-2-style
   math in `app/lib/srs.ts`, `review_items` table.
4. **Onboarding diagnostic** — ~12 questions at signup, sets initial node states
   so a career-switcher who knows Excel doesn't start at zero.
5. **Session briefing** — one card on every login: streak, active node, the
   single next action, a button to the right window.
6. **Command palette** (Ctrl/Cmd-K) over one action registry — open any window,
   jump to any node, search the textbook.
7. **Procedural SVG wallpaper engine** — 6–8 theme-aware wallpapers built from
   tokens (star field, dot grid, nebula, orbital rings, star chart, aurora,
   contour). Picker in Settings, choice synced. Registry entries typed
   `kind: 'svg' | 'image'` so user-supplied raster art drops into the same slot
   later.
8. **Public shareable progress page** (`/share/[handle]`) — read-only
   constellation for a portfolio/LinkedIn.
9. **`prefers-reduced-motion`** across the constellation (correctness, not a
   feature — the canvas has ~40 ambient animations).

### Parked (real, not now)
Sound design, achievement badges beyond XP, social/community, native mobile,
offline writes. The PWA offline **read-only** shell stays in scope as launch
hardening.

---

## Key bets

1. Schema-first and schema-complete. The single highest-leverage day of work.
2. Vendor-neutral adapters everywhere. You integrate interfaces, not companies.
3. Curriculum is a graph; unlock logic is one traversal function.
4. Content is pipelined behind a validated **SQL reference track**, not authored
   blind. Code is bulk; content authoring is inherently sequential.
5. Green `main`, always. CI enforces it.

---

## Step-by-step

### Phase 0 — Foundations (sequential, then freeze)

1. **Domain + repo + scaffold + hosting.** Register the domain (Namecheap or
   Cloudflare, ~$12/yr). `create-next-app` in `learning_OS/app` (TS, App Router,
   no Tailwind). `git init` at the `learning_OS` root. GitHub repo. Import into
   Vercel, point the domain. *(scaffold + local git: DONE. Domain + GitHub +
   Vercel need account owner.)*
2. **CI + branch protection.** `.github/workflows/ci.yml` runs `next build` +
   `tsc --noEmit` + lint on every PR. Protect `main`. Feature-flag module
   (`app/lib/flags.ts`). *(CI file + flags: DONE. Branch protection needs the
   GitHub repo.)*
3. **Design tokens + fonts + wallpaper engine.** Token block in
   `app/app/globals.css` (DONE). Self-host fonts with `next/font` (DONE).
   `app/components/wallpaper/` — `Wallpaper` component + registry of 6–8
   procedural SVG wallpapers, each token-driven so it themes automatically.
4. **Supabase project + complete schema.** `supabase init`; write the **entire**
   schema as SQL migrations in `supabase/migrations/`: `profiles`,
   `node_progress`, `xp_events`, `heatmap_activity`, `daily_log`, `notes`,
   `chapter_reads`, `bookmarks`, `video_catalog`, `video_watches`, `watch_queue`,
   `case_submissions`, `pm_ai_messages`, `pm_ai_declines`, `canvases`,
   `game_scores`, `game_attempts`, `review_items`, `diagnostic_results`,
   `tool_installs`. Row Level Security on every table (`user_id = auth.uid()`).
   Get it reviewed before building against it.
5. **Resend as Supabase SMTP, then auth.** Resend account, verify domain (3 DNS
   records), paste SMTP creds into Supabase Auth. Then build signup / 6-digit
   OTP / login / forgot-password / guest from Userflow Flows 1–3.
6. **State store + adapters + guest migration.** `app/lib/store.ts` (context +
   reducer, all actions). `adapters/localStorage.ts` and `adapters/supabase.ts`
   behind one interface. `migrateGuest.ts` — on signup, upsert the localStorage
   blob into Supabase.
7. **Curriculum graph + unlock logic.** `app/content/curriculum.ts` (DONE:
   topics + SQL + Git sub-nodes; other topics carry `plannedSubNodes` to be
   positioned). `app/lib/graph.ts` (DONE: `deriveStates`). Position + wire the
   remaining ~90 sub-nodes.
8. **Desktop shell + window manager + action registry.** `Desktop` (wallpaper,
   10-icon grid, taskbar: clock, XP, streak, theme toggle, avatar, daily-log
   quick input). `app/lib/useWindows.ts` (port drag/focus/z-stack from
   `docs/support.js`). `Window` chrome component. `app/lib/actions.ts` registry.
   Boot sequence.
9. **External adapters scaffolded (typed, empty).** `app/lib/ai/` (`Advisor`
   interface, `grok.ts`, `buildContext(userId)` pure fn). `app/lib/analytics/`
   (`track()` + PostHog reverse-proxy rewrites). `app/lib/video/` (types +
   `scripts/import-videos.mjs`).
10. **Sentry + rate limiter.** `@sentry/nextjs`. Upstash Redis + `app/lib/ratelimit.ts`.

**Contracts frozen. Everything below is a leaf — build in any order, one PR at a
time, each merged green, unfinished behind a flag.**

### Phase 1 — Feature windows (parallel)

11. Constellation Map + sub-constellations + node drawer (port `buildConstellation`
    from `docs/support.js` reference; wrap animations in reduced-motion check).
12. Textbook window + markdown pipeline (`app/content/textbook/<topic>/<slug>.md`,
    `react-markdown` + highlighter).
13. Cheatcodes window (static `app/content/cheatcodes.ts`, JOIN Venn SVGs, print view).
14. Daily Log + Heatmap + XP/streak (centralize XP amounts in one config).
15. Video Library (run `import-videos.mjs` on Semilore's spreadsheet -> `video_catalog`;
    filter sidebar, iframe embed, mark-watched, queue).
16. Case Files (20 markdown cases, submission state machine, Option C -> decline log,
    end-of-program Decline Log view).
17. PM-AI (`app/api/pm-ai/route.ts`: ratelimit -> `buildContext` -> `Advisor`;
    stream chat; system prompt versioned + red-team tested; every decline logged).
18. **Toolkit window** (`app/content/toolkit.ts` is seeded; build the window: category
    nav, per-tool detail with OS tabs, install steps, verify step, common problems;
    "mark installed" -> XP + heatmap; deep-link targets for sub-nodes).
19. Canvas (`<canvas>`, pen/text/shapes/sticky/image/eraser/pan/zoom, jsonb doc,
    30s autosave, named boards, PNG export).
20. Games (`sql.js` WASM SQLite for SQL Dojo's 30 levels first, then Data Detective,
    Pivot Puzzle, Chart Critiquer -> `Advisor` score).
21. Additions: Review queue + `app/lib/srs.ts` + `needs-review` map state;
    onboarding diagnostic; session briefing; command palette; Settings (theme,
    wallpaper, JSON export, reset); public `/share/[handle]` page.
22. Analytics wiring — `track(...)` at every PRD §16.1 event; session recording
    scoped to Constellation + Case Files.

### Phase 2 — Content pipeline (starts once steps 12, 16, 18 exist; runs alongside Phase 1)

23. Author the **SQL track** to completion: 26 chapters (`app/content/textbook/sql/`),
    SQL-linked case files, SQL Dojo's 30 levels. Follow PRD §10.2 style rules
    (plain words first, technical term in brackets, no em dashes, full depth,
    worked example, "Try This" linking a case or game).
24. Author the **Git track**: 15 chapters (`app/content/textbook/git/`) matching
    the sub-nodes in `curriculum.ts`, each cross-linking the relevant Toolkit
    entry and its common-problems list.
25. **Validate with one real learner** — full session on the SQL track, fix the
    *format* (chapter length, drawer flow, difficulty curve) before mass-producing.
26. Replicate the other tracks: Python, Excel, Statistics, Visualization, Power BI,
    Data Cleaning, Storytelling, Portfolio — chapters + linked cases, extending
    `curriculum.ts`. Curate + import remaining videos.

### Phase 3 — Launch hardening

27. Accessibility pass (keyboard nav of windows + constellation, reduced-motion
    verified, contrast both themes, focus-visible on neobrutalist controls).
28. Streak-reminder cron (`app/api/cron/streak-nudge/route.ts`, Vercel Cron daily
    -> Supabase -> Resend).
29. PWA offline read-only shell (service worker caches shell + read data; no
    offline writes).
30. Upgrade Supabase to Pro (no pause, backups). Make the PM-AI provider call
    (Grok free vs. ~$15/mo paid). One file either way.
31. Smoke test as fresh guest, then fresh account, then returning account with
    data. Confirm guest -> account migration loses nothing. Point the domain,
    announce.
