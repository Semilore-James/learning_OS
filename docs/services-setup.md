# External services — what to set, where

The app runs fully without any of these (analytics is a no-op, PM-AI returns a
"not reachable" line, auth emails use Supabase's shared sender). Turn them on
when you're ready. Nothing here goes in the repo — secrets live in
`app/.env.local` (git-ignored) locally and in **Vercel → Project → Settings →
Environment Variables** for the deploy.

## PostHog (product analytics) — code is DONE, just needs the key

The analytics layer is fully wired: typed events, a `/ingest` reverse-proxy so
adblockers don't drop events, hashed user id (never the raw id/email),
`track()` calls at every PRD §16.1 event. It is a no-op until the key is set.

1. Create a project at [posthog.com](https://posthog.com) (US cloud — the
   reverse-proxy in `next.config.ts` points at `us.i.posthog.com`; if you pick
   EU, change those two rewrite destinations to `eu.i.posthog.com` /
   `eu-assets.i.posthog.com`).
2. Project Settings → copy the **Project API Key** (starts `phc_`).
3. Set env vars:
   ```
   NEXT_PUBLIC_POSTHOG_KEY=phc_xxx
   NEXT_PUBLIC_POSTHOG_HOST=/ingest
   ```
4. Redeploy. Open the app, click around, check PostHog → Activity for
   `session_start`, `module_opened`, etc.

## Grok / xAI (PM-AI a.k.a. L_OS COMMS) — code is DONE, needs the key

`/api/pm-ai/chat` and `/api/pm-ai/review` return a graceful 503 until
`GROK_API_KEY` is set.

1. Get a key at [console.x.ai](https://console.x.ai).
2. Set (server-only — **no** `NEXT_PUBLIC_` prefix):
   ```
   GROK_API_KEY=xai-xxx
   GROK_BASE_URL=https://api.x.ai/v1
   GROK_MODEL=grok-3-mini
   ```
3. Rate limiting for that route uses Upstash — optional, set
   `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` if you want it, else the
   route runs without a limiter.
4. To swap providers later (Anthropic/OpenAI), implement another `Advisor` in
   `lib/ai/` and set `AI_PROVIDER`. The route is the only thing that changes.

## Resend (auth emails: confirm, OTP, magic link, reset)

Supabase sends auth emails from a shared address with a low rate limit. Point it
at Resend for real deliverability.

1. Create a [resend.com](https://resend.com) account, add and **verify your
   sending domain** (DNS: SPF + DKIM records they give you).
2. Resend → API Keys → create one.
3. Supabase Dashboard → Project → **Authentication → Emails → SMTP Settings** →
   enable custom SMTP:
   - Host: `smtp.resend.com`
   - Port: `465`
   - Username: `resend`
   - Password: your Resend API key
   - Sender email: something `@your-verified-domain`
   - Sender name: `DA // LEARNING OS`
4. Under **Authentication → Emails → Templates**, keep the OTP template using
   `{{ .Token }}` (the app's sign-up flow shows a 6-digit code, not a link).
5. Rotate the Resend key that was pasted in chat earlier if you haven't already.

## Two-factor auth (TOTP)

Supabase has built-in TOTP MFA. **Enrolment + challenge UI is a small remaining
build** (`components/settings/TwoFactor.tsx` for enrol, a code step in
`AuthScreen` on login when the account has an active factor). To enable the
backend now:

1. Supabase Dashboard → **Authentication → Providers / MFA** → ensure TOTP is
   enabled (it is by default on new projects).
2. Nothing else server-side. The app code uses
   `supabase.auth.mfa.enroll / challenge / verify` and
   `getAuthenticatorAssuranceLevel()` once the UI lands.

## Vercel

- Project → Settings → **Root Directory = `app`** (the Next app is in a subdir).
- Add all the env vars above for Production (and Preview if you want previews to
  have analytics).
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` from Supabase →
  Settings → API are the only ones the app *needs* to function.
