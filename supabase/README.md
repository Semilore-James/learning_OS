# Supabase

## Apply the schema

Two ways. Pick one.

### A. SQL Editor (no tooling)

1. Open your project at app.supabase.com → **SQL Editor** → **New query**.
2. Paste the entire contents of [`migrations/0001_init.sql`](migrations/0001_init.sql).
3. Run. It is safe to re-run (uses `IF NOT EXISTS` and drops policies before recreating).
4. Check **Table Editor** — you should see ~20 tables, and **Authentication → Policies**
   should show RLS enabled on all of them.

### B. Supabase CLI (preferred once set up)

```bash
npm i -g supabase
supabase login
supabase link --project-ref <your-project-ref>
supabase db push
```

## Auth settings to change in the dashboard

**Authentication → Providers → Email**
- Enable "Confirm email".
- Set OTP (confirmation) expiry to **600 seconds** (10 min).

**Authentication → SMTP Settings** — wire Resend so OTP emails actually send
(the built-in sender throttles at ~3/hour and will break signup testing):
1. Create a free account at resend.com, verify a sending domain (3 DNS records).
2. In Supabase, enable **Custom SMTP** with:
   - Host `smtp.resend.com`, Port `465`, User `resend`, Password = your Resend API key
   - Sender email on your verified domain
3. Send yourself a test signup and confirm the code arrives.

## Regenerate the TypeScript types after any schema change

```bash
npx supabase gen types typescript --project-id <ref> > ../app/lib/supabase/database.types.ts
```

## Keys — where they go

| Key | Prefix | Where it lives | Exposure |
|---|---|---|---|
| Project URL | `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` + Vercel | public, fine |
| `anon` key | `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` + Vercel | public by design — RLS protects data |
| `service_role` key | `SUPABASE_SERVICE_ROLE_KEY` (no `NEXT_PUBLIC_`) | `.env.local` + Vercel, **server only** | **secret** — bypasses RLS, treat like a password |

The `service_role` key is only used by `app/lib/supabase/admin.ts` for trusted
server jobs (e.g. the streak-reminder cron). It is never sent to the browser.

## Auth setup (for the login screens)

The app's sign-up flow expects a **6-digit code**, not a magic link.

1. **Dashboard → Authentication → Providers → Email**: turn on *Confirm email*.
2. **Dashboard → Authentication → Emails → Templates → Confirm signup**: replace
   the `{{ .ConfirmationURL }}` line with `{{ .Token }}` so the email sends the
   code. (Do the same for *Magic Link* if you want passwordless later.)
3. **Custom SMTP** (Authentication → Emails → SMTP Settings) — without it the
   built-in sender throttles at ~3 emails/hour. Use Resend:
   - Host `smtp.resend.com` · Port `465` · User `resend` · Password = a Resend
     API key · Sender `onboarding@resend.dev` (until a domain is verified).
4. **Vercel env vars** (Project Settings → Environment Variables):
   `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`. Until these are
   set the app runs guest-only and the login screen says so.
