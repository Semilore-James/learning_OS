/* ============================================================================
   Guest -> account migration. Called once, right after sign-up succeeds, while
   the new user's session is active. Copies the localStorage blob into Supabase
   so no progress is lost, then clears the blob.
   ========================================================================== */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import type { AppState } from "./types";
import { readGuestBlob, clearGuestBlob } from "./adapters/local";

type DB = SupabaseClient<Database>;

export async function migrateGuestToAccount(sb: DB, userId: string): Promise<boolean> {
  const blob = readGuestBlob();
  if (!blob || Object.keys(blob).length === 0) return false;

  const s = blob as Partial<AppState>;
  const ins: Array<PromiseLike<unknown>> = [];

  if (s.profile) {
    ins.push(
      sb.from("profiles").update({
        display_name: s.profile.displayName,
        theme: s.profile.theme,
        skin: s.profile.skin,
        wallpaper_id: s.profile.wallpaperId,
        onboarding_done: s.profile.onboardingDone,
        reduce_effects: s.profile.reduceEffects,
      }).eq("id", userId),
    );
  }

  if (s.nodes && Object.keys(s.nodes).length) {
    ins.push(
      sb.from("node_progress").upsert(
        Object.entries(s.nodes).map(([node_id, p]) => ({
          user_id: userId,
          node_id,
          node_level: p.level,
          topic_id: p.topicId,
          state: p.state,
          started_at: p.startedAt,
          completed_at: p.completedAt,
        })),
        { onConflict: "user_id,node_id" },
      ),
    );
  }

  // XP total -> one synthetic event so the sum matches
  if (s.xpTotal && s.xpTotal > 0) {
    ins.push(sb.from("xp_events").insert({ user_id: userId, action: "guest_migration", amount: s.xpTotal }));
  }

  if (s.heatmap && Object.keys(s.heatmap).length) {
    ins.push(
      sb.from("heatmap_activity").insert(
        Object.entries(s.heatmap).map(([day, weight]) => ({
          user_id: userId,
          day,
          source: "guest_migration",
          weight: Math.min(4, Math.max(1, weight)),
        })),
      ),
    );
  }

  if (s.dailyLog && Object.keys(s.dailyLog).length) {
    ins.push(
      sb.from("daily_log").upsert(
        Object.entries(s.dailyLog).map(([day, e]) => ({
          user_id: userId,
          day,
          body: e.body,
          node_tag: e.nodeTag,
          locked: e.locked,
        })),
        { onConflict: "user_id,day" },
      ),
    );
  }

  if (s.notes) {
    for (const [node_id, body] of Object.entries(s.notes)) {
      ins.push(sb.from("notes").upsert({ user_id: userId, node_id, body }, { onConflict: "user_id,node_id" }));
    }
  }
  if (s.chapterReads) {
    ins.push(
      sb.from("chapter_reads").upsert(
        Object.entries(s.chapterReads).map(([chapter_slug, read_at]) => ({ user_id: userId, chapter_slug, read_at })),
        { onConflict: "user_id,chapter_slug", ignoreDuplicates: true },
      ),
    );
  }
  if (s.bookmarks?.length) {
    ins.push(
      sb.from("bookmarks").upsert(
        s.bookmarks.map((chapter_slug) => ({ user_id: userId, chapter_slug })),
        { onConflict: "user_id,chapter_slug", ignoreDuplicates: true },
      ),
    );
  }
  if (s.cases && Object.keys(s.cases).length) {
    ins.push(
      sb.from("case_submissions").upsert(
        Object.entries(s.cases).map(([case_id, c]) => ({
          user_id: userId,
          case_id,
          status: c.status,
          body: c.body,
          started_at: c.startedAt,
          submitted_at: c.submittedAt,
          pm_ai_response: c.pmAiResponse as never,
        })),
        { onConflict: "user_id,case_id" },
      ),
    );
  }
  if (s.toolInstalls?.length) {
    ins.push(
      sb.from("tool_installs").upsert(
        s.toolInstalls.map((tool_id) => ({ user_id: userId, tool_id })),
        { onConflict: "user_id,tool_id", ignoreDuplicates: true },
      ),
    );
  }
  if (s.review?.length) {
    ins.push(
      sb.from("review_items").upsert(
        s.review.map((r) => ({
          user_id: userId,
          node_id: r.nodeId,
          concept: r.concept,
          ease: r.ease,
          interval_days: r.intervalDays,
          reps: r.reps,
          due_on: r.dueOn,
          last_reviewed_at: r.lastReviewedAt,
        })),
        { onConflict: "user_id,node_id,concept", ignoreDuplicates: true },
      ),
    );
  }

  const results = await Promise.allSettled(ins);
  const failed = results.filter((r) => r.status === "rejected");
  if (failed.length) {
    console.error("[migrateGuest] some rows failed", failed);
    return false; // keep the blob so the user can retry
  }

  clearGuestBlob();
  return true;
}
