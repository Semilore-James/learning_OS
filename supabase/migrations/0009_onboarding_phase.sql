-- First-run flow is now a small state machine, not a single boolean:
--   mission -> calibration -> orientation -> done
-- onboarding_done stays as a mirror (true iff phase = 'done') for anything
-- still reading it.

alter table public.profiles
  add column if not exists onboarding_phase text not null default 'mission'
    check (onboarding_phase in ('mission', 'calibration', 'orientation', 'done'));

-- everyone who already finished the old flow skips straight to done
update public.profiles
  set onboarding_phase = 'done'
  where onboarding_done = true and onboarding_phase = 'mission';
