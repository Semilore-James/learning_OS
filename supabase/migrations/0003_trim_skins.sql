-- ============================================================================
-- Trim the skin set to the three the product keeps: neobrutalism, swiss,
-- glassmorphism. Any profile on a removed skin falls back to neobrutalism.
-- ============================================================================

update public.profiles
set skin = 'neobrutalism'
where skin not in ('neobrutalism', 'swiss', 'glassmorphism');

alter table public.profiles drop constraint if exists profiles_skin_check;

alter table public.profiles
  add constraint profiles_skin_check
  check (skin in ('neobrutalism', 'swiss', 'glassmorphism'));
