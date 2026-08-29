# Security notes

## Secrets never enter the repo

Real keys live in **`app/.env.local`** (git-ignored) for local dev and in
**Vercel → Project Settings → Environment Variables** for deploy. Nothing
secret is committed. `app/.env.example` holds variable names only.

## What is safe to be public vs. what is not

| Value | Safe in the browser? | Why |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | yes | just an address |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | yes | public by design; **Row Level Security** is what protects the data. Every table has RLS on and a policy that limits a user to their own rows. |
| `SUPABASE_SERVICE_ROLE_KEY` | **no** | bypasses RLS entirely. Server-only, used only by `app/lib/supabase/admin.ts` for trusted jobs (cron). |
| `GROQ_API_KEY`, `ANTHROPIC_API_KEY` | **no** | billable; used only inside `app/api/pm-ai/*` route handlers |
| `YOUTUBE_API_KEY` | **no** | quota-limited; used only by `scripts/import-videos.mjs` at build time |
| `UPSTASH_*`, `CRON_SECRET` | **no** | server-only |

## How the codebase enforces this

- `app/lib/env.ts` exposes only public values.
- `app/lib/env.server.ts` and `app/lib/supabase/admin.ts` start with
  `import "server-only"` — importing them into a client component is a build
  error.
- Any secret prefixed `NEXT_PUBLIC_` by mistake would ship to the browser, so
  the rule is: **secrets never get that prefix.**

## If a key leaks

Rotate it immediately in the provider dashboard (Supabase → Settings → API →
"Reset service_role key", etc.), update `.env.local` and Vercel, redeploy. A
key that was ever committed is compromised even after the commit is removed,
because it stays in git history.
