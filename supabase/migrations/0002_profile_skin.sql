-- ============================================================================
-- Add a "skin" (visual design language) preference to profiles.
-- Orthogonal to theme (dark/light): theme drives the colour palette, skin
-- drives chrome — borders, shadows, radius, typography, panel treatment.
-- ============================================================================

alter table public.profiles
  add column if not exists skin text not null default 'neobrutalism'
  check (skin in (
    'neobrutalism',
    'swiss',
    'brutalist-web',
    'memphis',
    'retro-futurism',
    'glassmorphism'
  ));
