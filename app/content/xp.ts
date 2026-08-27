/* ============================================================================
   XP amounts and heatmap weights — single source of truth (PRD sections 12 & 17).
   Every feature that awards progress reads from here. Never hardcode a number
   at a call site.
   ========================================================================== */

export const XP = {
  daily_log: 20,
  chapter_read: 25,
  video_watched: 30,
  game_level: 40,
  canvas_session: 15,
  case_started: 10,
  case_submitted: 80,
  pm_ai_review_accepted: 50,
  sub_node_completed: 100,
  topic_node_completed: 300,
  streak_7: 150,
  streak_30: 500,
  review_answered: 15,
  tool_installed: 15,
} as const;

export type XpAction = keyof typeof XP;

/** heatmap contribution weight (1–4) per activity source (PRD 12.1) */
export const HEATMAP_WEIGHT = {
  daily_log: 1,
  video: 2,
  game: 2,
  canvas: 1,
  case_start: 2,
  case_submit: 3,
  node_complete: 4,
  review: 1,
  tool_install: 1,
} as const;

export type HeatmapSource = keyof typeof HEATMAP_WEIGHT;
