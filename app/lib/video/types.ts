/* ============================================================================
   Video types. The catalog is reference data in Supabase (video_catalog),
   populated at build time by scripts/import-videos.mjs from a spreadsheet.
   The app NEVER calls the YouTube Data API at runtime — only the iframe embed,
   which is free and unmetered.
   ========================================================================== */

export type Difficulty = "beginner" | "intermediate" | "advanced";

export interface VideoMeta {
  /** youtube video id (the v= param) */
  id: string;
  title: string;
  channel: string;
  durationSeconds: number | null;
  difficulty: Difficulty | null;
  /** curriculum node ids this video supports, e.g. ["sql", "joins"] */
  skillTags: string[];
}

/** the YouTube embed URL — the only YouTube call made at runtime */
export function embedUrl(id: string, opts: { autoplay?: boolean } = {}): string {
  const p = new URLSearchParams({
    rel: "0",
    modestbranding: "1",
    ...(opts.autoplay ? { autoplay: "1" } : {}),
  });
  return `https://www.youtube-nocookie.com/embed/${id}?${p}`;
}

export function watchUrl(id: string): string {
  return `https://www.youtube.com/watch?v=${id}`;
}

export function formatDuration(seconds: number | null): string {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}
