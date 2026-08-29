import "server-only";

/* ============================================================================
   SERVER-ONLY secrets. The "server-only" import above makes this file a build
   error if it is ever imported into a client component.

   These values bypass Row Level Security or cost money if leaked. Treat them
   like passwords: never prefix them NEXT_PUBLIC_, never log them, never send
   them to the browser, never commit them. They are set in app/.env.local
   locally and in Vercel Environment Variables for deploy.
   ========================================================================== */

export const serverEnv = {
  /** Supabase service role — BYPASSES RLS. Only for trusted jobs (e.g. the
   *  streak-reminder cron that must read every user). Never use it to serve a
   *  request on behalf of a logged-in user; use their session + RLS instead. */
  supabaseServiceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY ?? "",

  /** Groq API key for the PM-AI route (serves open models, OpenAI-compatible) */
  groqApiKey: process.env.GROQ_API_KEY ?? "",
  /** fallback LLM provider, decision deferred to launch week */
  anthropicApiKey: process.env.ANTHROPIC_API_KEY ?? "",

  /** Upstash Redis REST — rate limiting the PM-AI route */
  upstashRedisUrl: process.env.UPSTASH_REDIS_REST_URL ?? "",
  upstashRedisToken: process.env.UPSTASH_REDIS_REST_TOKEN ?? "",

  /** YouTube Data API key — used by scripts/import-videos.mjs at build time only */
  youtubeApiKey: process.env.YOUTUBE_API_KEY ?? "",

  /** shared secret so only Vercel Cron can invoke /api/cron/* */
  cronSecret: process.env.CRON_SECRET ?? "",
};
