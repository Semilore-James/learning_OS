-- ============================================================================
-- DA // LEARNING OS  —  migration 0006  —  video playback progress
-- ----------------------------------------------------------------------------
-- Where a learner stopped in each video, so "continue where you left off"
-- follows them across devices. One row per (user, video). RLS: own rows only.
-- Safe to re-run.
-- ============================================================================

create table if not exists public.video_progress (
  user_id     uuid not null references auth.users(id) on delete cascade,
  video_id    text not null,
  seconds     integer not null default 0,
  updated_at  timestamptz not null default now(),
  primary key (user_id, video_id)
);

alter table public.video_progress enable row level security;

drop policy if exists own_rows on public.video_progress;
create policy own_rows on public.video_progress
  for all
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

create index if not exists video_progress_user_idx on public.video_progress(user_id, updated_at desc);
