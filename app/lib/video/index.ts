export {
  embedUrl,
  watchUrl,
  formatDuration,
  type VideoMeta,
  type Difficulty,
} from "./types";

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { VideoMeta } from "./types";

/** read the catalog (world-readable reference data) — filter by skill tag */
export async function loadVideos(
  sb: SupabaseClient<Database>,
  skillTag?: string,
): Promise<VideoMeta[]> {
  let q = sb.from("video_catalog").select("*");
  if (skillTag) q = q.contains("skill_tags", [skillTag]);
  const { data, error } = await q;
  if (error) throw error;
  return (data ?? []).map((v) => ({
    id: v.id,
    title: v.title,
    channel: v.channel,
    durationSeconds: v.duration_seconds,
    difficulty: v.difficulty as VideoMeta["difficulty"],
    skillTags: v.skill_tags,
  }));
}
