/* ============================================================================
   Cloud sync for the window-local stores that don't live in AppState — canvas
   boards and video playback progress. Strategy: localStorage stays the working
   copy (fast, synchronous for the UI); this module pulls the server copy on
   sign-in and pushes local changes on a timer / on blur. Last-write-wins by
   updatedAt — fine for a single-user learning app.
   ========================================================================== */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { El } from "@/components/canvas/shapes";
import { allBoards, upsertLocalBoard } from "@/lib/canvas/boards";
import { allProgress, getProgress, mergeProgress } from "@/lib/video/progress";

type DB = SupabaseClient<Database>;

/* ---------------------------------------------------------------- boards --- */

export async function pullBoards(sb: DB, userId: string): Promise<void> {
  const { data, error } = await sb
    .from("canvases")
    .select("id,name,doc,updated_at")
    .eq("user_id", userId);
  if (error || !data) return;
  for (const row of data) {
    upsertLocalBoard({
      id: row.id,
      name: row.name,
      updatedAt: row.updated_at,
      els: (Array.isArray(row.doc) ? row.doc : []) as unknown as El[],
    });
  }
}

export async function pushBoards(sb: DB, userId: string): Promise<void> {
  const local = allBoards();
  if (local.length === 0) return;
  const { data: remote } = await sb
    .from("canvases")
    .select("id,updated_at")
    .eq("user_id", userId);
  const remoteAt = new Map((remote ?? []).map((r) => [r.id, r.updated_at]));

  const toUpsert = local.filter((b) => {
    const at = remoteAt.get(b.id);
    return !at || at < b.updatedAt;
  });
  if (toUpsert.length > 0) {
    await sb.from("canvases").upsert(
      toUpsert.map((b) => ({
        id: b.id,
        user_id: userId,
        name: b.name,
        doc: b.els as unknown as Database["public"]["Tables"]["canvases"]["Insert"]["doc"],
        updated_at: b.updatedAt,
      })),
    );
  }

  // boards deleted locally that still exist remotely → delete remotely
  const localIds = new Set(local.map((b) => b.id));
  const orphans = [...remoteAt.keys()].filter((id) => !localIds.has(id));
  if (orphans.length > 0) {
    await sb.from("canvases").delete().eq("user_id", userId).in("id", orphans);
  }
}

/* -------------------------------------------------------------- video ----- */

export async function pullVideoProgress(sb: DB, userId: string): Promise<void> {
  const { data } = await sb.from("video_progress").select("video_id,seconds").eq("user_id", userId);
  for (const row of data ?? []) mergeProgress(row.video_id, row.seconds);
}

export async function pushVideoProgress(sb: DB, userId: string): Promise<void> {
  const local = allProgress();
  const ids = Object.keys(local);
  if (ids.length === 0) return;
  const { data: remote } = await sb
    .from("video_progress")
    .select("video_id,seconds")
    .eq("user_id", userId);
  const remoteSec = new Map((remote ?? []).map((r) => [r.video_id, r.seconds]));

  const rows = ids
    .filter((id) => getProgress(id) > (remoteSec.get(id) ?? 0))
    .map((id) => ({ user_id: userId, video_id: id, seconds: getProgress(id), updated_at: new Date().toISOString() }));
  if (rows.length > 0) await sb.from("video_progress").upsert(rows);
}
