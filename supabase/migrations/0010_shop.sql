-- ============================================================================
-- DA // LEARNING OS  —  migration 0010  —  shop (unlocks + equipped + assets)
-- ----------------------------------------------------------------------------
-- Coins already accrue (0008). This adds the SPEND side:
--   * user_unlocks  — one row per owned cosmetic item id. RLS: own rows only.
--   * profiles.equipped_icon_set / equipped_companion — the active cosmetics.
--   * storage bucket "shop-assets" (public read) for large assets (companions).
-- A purchase also appends a negative row to coin_events (see 0008); the app's
-- Supabase adapter writes both. Safe to re-run.
-- ============================================================================

-- ---------- owned items --------------------------------------------------

create table if not exists public.user_unlocks (
  user_id     uuid not null references auth.users(id) on delete cascade,
  item_id     text not null,
  acquired_at timestamptz not null default now(),
  primary key (user_id, item_id)
);

alter table public.user_unlocks enable row level security;

drop policy if exists own_rows on public.user_unlocks;
create policy own_rows on public.user_unlocks
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists user_unlocks_user_idx on public.user_unlocks(user_id);

-- ---------- equipped cosmetics ----------------------------------------

alter table public.profiles
  add column if not exists equipped_icon_set  text,
  add column if not exists equipped_companion text;

-- ---------- storage: shop-assets bucket (public read) ------------------

insert into storage.buckets (id, name, public)
values ('shop-assets', 'shop-assets', true)
on conflict (id) do update set public = true;

drop policy if exists "shop-assets public read" on storage.objects;
create policy "shop-assets public read" on storage.objects
  for select
  using (bucket_id = 'shop-assets');
