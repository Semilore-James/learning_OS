#!/usr/bin/env node
/* ============================================================================
   Import a video spreadsheet into Supabase `video_catalog`.

   Semilore fills a CSV (see app/content/videos.sample.csv) with three columns:
     youtube_url_or_id  — full watch URL, youtu.be link, or bare id
     skill_tags         — pipe-separated curriculum node ids, e.g. sql|joins
     difficulty         — beginner | intermediate | advanced   (optional)

   This script resolves each video's title / channel / duration from the
   YouTube Data API (one `videos.list` call per 50 ids = 1 quota unit each),
   then upserts to video_catalog with the service role key. Run it whenever the
   sheet changes; the app itself never touches the YouTube API.

   Usage:
     YOUTUBE_API_KEY=... SUPABASE_SERVICE_ROLE_KEY=... \
     NEXT_PUBLIC_SUPABASE_URL=... \
     node scripts/import-videos.mjs path/to/videos.csv
   ========================================================================== */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const csvPath = process.argv[2];
if (!csvPath) {
  console.error("usage: node scripts/import-videos.mjs <videos.csv>");
  process.exit(1);
}

const {
  YOUTUBE_API_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
} = process.env;

for (const [k, v] of Object.entries({
  YOUTUBE_API_KEY,
  SUPABASE_SERVICE_ROLE_KEY,
  NEXT_PUBLIC_SUPABASE_URL,
})) {
  if (!v) {
    console.error(`missing env var: ${k}`);
    process.exit(1);
  }
}

/** pull the 11-char video id out of any YouTube URL form */
function toId(s) {
  s = s.trim();
  const m =
    s.match(/[?&]v=([\w-]{11})/) ||
    s.match(/youtu\.be\/([\w-]{11})/) ||
    s.match(/\/embed\/([\w-]{11})/) ||
    s.match(/^([\w-]{11})$/);
  return m ? m[1] : null;
}

/** ISO8601 duration (PT1H2M3S) -> seconds */
function isoToSeconds(iso) {
  const m = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!m) return null;
  return (+(m[1] || 0)) * 3600 + (+(m[2] || 0)) * 60 + +(m[3] || 0);
}

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/);
  const header = lines.shift().split(",").map((h) => h.trim());
  return lines
    .filter(Boolean)
    .map((line) => {
      const cells = line.split(",");
      const row = {};
      header.forEach((h, i) => (row[h] = (cells[i] ?? "").trim()));
      return row;
    });
}

const rows = parseCsv(readFileSync(csvPath, "utf8"));

const wanted = new Map(); // id -> { skillTags, difficulty }
for (const r of rows) {
  const id = toId(r.youtube_url_or_id || r.youtube_url || r.id || "");
  if (!id) {
    console.warn("skipping unrecognised row:", r);
    continue;
  }
  wanted.set(id, {
    skillTags: (r.skill_tags || "").split("|").map((s) => s.trim()).filter(Boolean),
    difficulty: ["beginner", "intermediate", "advanced"].includes(r.difficulty)
      ? r.difficulty
      : null,
  });
}

const ids = [...wanted.keys()];
console.log(`resolving ${ids.length} videos from YouTube...`);

const catalog = [];
for (let i = 0; i < ids.length; i += 50) {
  const batch = ids.slice(i, i + 50);
  const url = `https://www.googleapis.com/youtube/v3/videos?part=snippet,contentDetails&id=${batch.join(",")}&key=${YOUTUBE_API_KEY}`;
  const res = await fetch(url);
  if (!res.ok) {
    console.error(`YouTube API ${res.status}: ${await res.text()}`);
    process.exit(1);
  }
  const data = await res.json();
  for (const item of data.items ?? []) {
    const w = wanted.get(item.id);
    catalog.push({
      id: item.id,
      title: item.snippet.title,
      channel: item.snippet.channelTitle,
      duration_seconds: isoToSeconds(item.contentDetails.duration),
      difficulty: w?.difficulty ?? null,
      skill_tags: w?.skillTags ?? [],
    });
  }
}

const missing = ids.filter((id) => !catalog.some((c) => c.id === id));
if (missing.length) console.warn(`not found / private / deleted: ${missing.join(", ")}`);

const sb = createClient(NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const { error } = await sb.from("video_catalog").upsert(catalog, { onConflict: "id" });
if (error) {
  console.error("upsert failed:", error);
  process.exit(1);
}

console.log(`upserted ${catalog.length} videos to video_catalog.`);
