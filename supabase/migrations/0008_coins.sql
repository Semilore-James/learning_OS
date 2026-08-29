-- ============================================================================
-- DA // LEARNING OS  —  migration 0008  —  coin ledger
-- ----------------------------------------------------------------------------
-- Cosmetic currency (docs/coin-economy.md). Append-only: positive rows are
-- earns (chapter read, node/case complete, game clear, streak day), negative
-- rows are purchases. Balance = sum(amount). RLS: own rows only.
-- Safe to re-run.
-- ============================================================================

create table if not exists public.coin_events (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  reason      text not null,
  amount      integer not null,
  created_at  timestamptz not null default now()
);

alter table public.coin_events enable row level security;

drop policy if exists own_rows on public.coin_events;
create policy own_rows on public.coin_events
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists coin_events_user_idx on public.coin_events(user_id, created_at);
