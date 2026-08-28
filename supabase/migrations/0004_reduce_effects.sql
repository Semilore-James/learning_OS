-- ============================================================================
-- "Reduce celebration effects" — a per-account preference on top of the OS-level
-- prefers-reduced-motion. Motion primitives (Burst, Pulse, CountUp, Typewriter)
-- check both.
-- ============================================================================

alter table public.profiles
  add column if not exists reduce_effects boolean not null default false;
