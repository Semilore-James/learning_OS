-- Shop / spend side. See docs/shop-spec.md.
-- Earn side (coin_events) is migration 0008 and stays as the balance ledger;
-- purchases are negative coin_events rows written by the existing adapter
-- mirror. This migration only adds ownership + equipped state.

create table if not exists public.user_unlocks (
  user_id uuid not null references auth.users(id) on delete cascade,
  item_id text not null,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.user_unlocks enable row level security;

drop policy if exists own_unlocks on public.user_unlocks;
create policy own_unlocks on public.user_unlocks
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- which cosmetic is active in each non-wallpaper, non-skin slot
-- (wallpaper_id and skin stay as their own profile columns)
alter table public.profiles
  add column if not exists equipped jsonb not null default '{}'::jsonb;
