/* ============================================================================
   Public environment variables — compiled into the browser bundle.
   ONLY values that are safe to be public belong here.

   The Supabase anon key is public by design; Row Level Security is what
   actually protects the data. Server-only secrets live in ./env.server.ts,
   which is import-guarded so it can never reach a client component.

   Real values live in:
     - app/.env.local                              (local dev, git-ignored)
     - Vercel Project Settings > Environment Vars  (deploy)
   ========================================================================== */

export const publicEnv = {
  supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL ?? "",
  supabaseAnonKey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "",
  posthogKey: process.env.NEXT_PUBLIC_POSTHOG_KEY ?? "",
  posthogHost: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "/ingest",
  flags: process.env.NEXT_PUBLIC_FLAGS ?? "",
};

export function assertPublicEnv() {
  const missing: string[] = [];
  if (!publicEnv.supabaseUrl) missing.push("NEXT_PUBLIC_SUPABASE_URL");
  if (!publicEnv.supabaseAnonKey) missing.push("NEXT_PUBLIC_SUPABASE_ANON_KEY");
  if (missing.length) {
    throw new Error(
      `Missing public env vars: ${missing.join(", ")}. See app/.env.example.`,
    );
  }
}
