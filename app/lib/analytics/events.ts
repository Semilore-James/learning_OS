/* ============================================================================
   Analytics event contract (PRD section 16.1). One typed map so call sites
   can't invent event names or drift on property shapes. `track()` in
   ./posthog.ts only accepts keys of this map.
   ========================================================================== */

export interface EventMap {
  session_start: { theme: string; current_node: string | null; xp_total: number };
  module_opened: { module_name: string };
  node_clicked: { node_name: string; node_level: "topic" | "sub"; node_state: string };
  sub_node_clicked: { topic: string; sub_node_name: string; state: string };
  video_watched: { video_id: string; channel: string; skill_tag: string; duration_minutes: number };
  case_started: { case_id: string; difficulty: string };
  case_submitted: { case_id: string; difficulty: string; days_in_progress: number };
  pm_ai_prompt: { prompt_category: string };
  pm_ai_declined: { decline_reason: string };
  game_completed: { game_name: string; score: number; difficulty_level: number };
  daily_log_written: { char_count: number; active_node: string | null };
  canvas_session: { canvas_name: string; duration_minutes: number };
  textbook_chapter_read: { book_title: string; chapter_title: string };
  cheatcode_opened: { cheatcode_type: string };
  theme_toggled: { new_theme: string };
  skin_changed: { new_skin: string };
  wallpaper_changed: { wallpaper_id: string };
  streak_milestone: { streak_days: number };
  xp_milestone: { xp_total: number };
  node_completed: { node_name: string; topic: string };
  tool_installed: { tool_id: string };
  shop_item_purchased: { item_id: string; category: string; rarity: string; price: number };
  shop_item_equipped: { slot: string; item_id: string | null };
}

export type EventName = keyof EventMap;
