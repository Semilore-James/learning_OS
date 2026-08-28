-- ============================================================================
-- DA // LEARNING OS  —  migration 0005  —  public share page
-- ----------------------------------------------------------------------------
-- Adds an opt-in public progress page at /share/<handle>.
--
--   * profiles.handle       — the URL slug (unique, case-insensitive, nullable)
--   * profiles.share_public — master switch, defaults OFF
--
-- No table RLS is loosened. The ONLY way anonymous visitors read anything is
-- public.shared_progress(handle), a SECURITY DEFINER function that returns a
-- fixed, non-sensitive JSON summary and only for profiles with share_public = true.
-- Safe to re-run.
-- ============================================================================

create extension if not exists "citext";

alter table public.profiles add column if not exists handle       citext;
alter table public.profiles add column if not exists share_public boolean not null default false;

do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_handle_key'
  ) then
    alter table public.profiles add constraint profiles_handle_key unique (handle);
  end if;
end $$;

-- keep handles URL-safe: 3-30 chars, lower alnum + dash/underscore
do $$
begin
  if not exists (
    select 1 from pg_constraint where conname = 'profiles_handle_format'
  ) then
    alter table public.profiles add constraint profiles_handle_format
      check (handle is null or handle ~ '^[a-z0-9_-]{3,30}$');
  end if;
end $$;

-- ---------- the one public read path --------------------------------------

create or replace function public.shared_progress(p_handle text)
returns json
language sql
stable
security definer
set search_path = public
as $$
  with me as (
    select id, display_name, handle
    from public.profiles
    where handle = p_handle::citext and share_public = true
    limit 1
  )
  select case when me.id is null then null else json_build_object(
    'handle',        me.handle,
    'displayName',   coalesce(me.display_name, 'An analyst'),
    'xpTotal',       coalesce((select sum(amount) from public.xp_events   where user_id = me.id), 0),
    'nodesComplete', coalesce((select count(*)     from public.node_progress
                                 where user_id = me.id and state = 'completed' and node_level = 'sub'), 0),
    'topicsComplete',coalesce((select json_agg(node_id order by completed_at)
                                 from public.node_progress
                                 where user_id = me.id and state = 'completed' and node_level = 'topic'), '[]'::json),
    'casesComplete', coalesce((select count(*)     from public.case_submissions
                                 where user_id = me.id and status in ('complete','complete_override')), 0),
    'gamesCleared',  coalesce((select count(*)     from public.game_scores where user_id = me.id and level > 0), 0),
    'activeDays',    coalesce((select count(distinct day) from public.heatmap_activity where user_id = me.id), 0),
    'lastActive',    (select max(day) from public.heatmap_activity where user_id = me.id)
  ) end
  from me;
$$;

revoke all on function public.shared_progress(text) from public;
grant execute on function public.shared_progress(text) to anon, authenticated;
