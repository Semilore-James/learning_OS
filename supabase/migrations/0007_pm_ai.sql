-- ============================================================================
-- DA // LEARNING OS  —  migration 0007  —  PM-AI usage ledger + memory
-- ----------------------------------------------------------------------------
-- pm_ai_usage : one row per advisor call. Enforces the per-user rate limit
--               (count rows in a rolling window) AND feeds the "PM's attention"
--               bar in the chat composer. Replaces the Upstash limiter.
-- pm_ai_memory: the PM's memory of one learner, split by who can update it:
--               facts    - structured jsonb, written only by server code that
--                          already knows the fact (open thread, unresolved
--                          gaps, pointers already given, greetings already
--                          used). No model touches this.
--               notes_md - freeform hyperdense markdown (how they think, how
--                          they communicate). Rewritten by a cheap model,
--                          token-capped, last-write-wins. Also shown to the
--                          learner read-only ("what your PM knows about you").
-- RLS: a learner sees and writes only their own rows.
-- Safe to re-run.
-- ============================================================================

-- ---- usage ledger --------------------------------------------------------
create table if not exists public.pm_ai_usage (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  kind        text not null check (kind in ('chat', 'review', 'chat_image')),
  weight      integer not null default 1,
  created_at  timestamptz not null default now()
);

alter table public.pm_ai_usage enable row level security;

drop policy if exists own_rows on public.pm_ai_usage;
create policy own_rows on public.pm_ai_usage
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists pm_ai_usage_window_idx
  on public.pm_ai_usage(user_id, created_at desc);

-- ---- memory ------------------------------------------------------------
create table if not exists public.pm_ai_memory (
  user_id     uuid primary key references auth.users(id) on delete cascade,
  facts       jsonb not null default '{}'::jsonb,
  notes_md    text  not null default '',
  updated_at  timestamptz not null default now()
);

alter table public.pm_ai_memory enable row level security;

drop policy if exists own_rows on public.pm_ai_memory;
create policy own_rows on public.pm_ai_memory
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());
