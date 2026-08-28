/* ============================================================================
   Supabase adapter — the account backing store. Same StoreAdapter interface as
   the local adapter, so the provider swaps one for the other by login state and
   nothing else changes.

   loadState: read every user-scoped table, assemble the AppState shape.
   commit:    switch on the action, write the minimal set of rows.

   Every query runs as the logged-in user under Row Level Security, so "their
   own rows" is enforced by the database, not by these filters.
   ========================================================================== */
import type { SupabaseClient } from "@supabase/supabase-js";
import { XP, HEATMAP_WEIGHT } from "@/content/xp";
import type { Database } from "@/lib/supabase/database.types";
import type { AppState, CaseState, StoreAdapter } from "../types";
import { todayUTC } from "../reducer";

type DB = SupabaseClient<Database>;

export function supabaseAdapter(sb: DB, userId: string): StoreAdapter {
  const mine = <T>(p: PromiseLike<{ data: T; error: unknown }>) =>
    p.then(({ data, error }) => {
      if (error) throw error;
      return data;
    });

  async function addXp(action: keyof typeof XP, amount: number, meta: Record<string, unknown> = {}) {
    await mine(sb.from("xp_events").insert({ user_id: userId, action, amount, meta: meta as never }));
  }
  async function addHeat(source: keyof typeof HEATMAP_WEIGHT) {
    await mine(
      sb.from("heatmap_activity").insert({
        user_id: userId,
        day: todayUTC(),
        source,
        weight: HEATMAP_WEIGHT[source],
      }),
    );
  }

  return {
    async loadState(): Promise<Partial<AppState>> {
      const [
        profile,
        nodes,
        xp,
        heat,
        log,
        notes,
        reads,
        marks,
        watches,
        queue,
        cases,
        scores,
        review,
        tools,
        declines,
      ] = await Promise.all([
        mine(sb.from("profiles").select("*").eq("id", userId).maybeSingle()),
        mine(sb.from("node_progress").select("*").eq("user_id", userId)),
        mine(sb.from("xp_events").select("amount").eq("user_id", userId)),
        mine(sb.from("heatmap_activity").select("day,weight").eq("user_id", userId)),
        mine(sb.from("daily_log").select("*").eq("user_id", userId)),
        mine(sb.from("notes").select("node_id,body").eq("user_id", userId)),
        mine(sb.from("chapter_reads").select("chapter_slug,read_at").eq("user_id", userId)),
        mine(sb.from("bookmarks").select("chapter_slug").eq("user_id", userId)),
        mine(sb.from("video_watches").select("video_id,watched_at,note").eq("user_id", userId)),
        mine(sb.from("watch_queue").select("video_id").eq("user_id", userId)),
        mine(sb.from("case_submissions").select("*").eq("user_id", userId)),
        mine(sb.from("game_scores").select("game,level,score").eq("user_id", userId)),
        mine(sb.from("review_items").select("*").eq("user_id", userId)),
        mine(sb.from("tool_installs").select("tool_id").eq("user_id", userId)),
        mine(sb.from("pm_ai_declines").select("id").eq("user_id", userId)),
      ]);

      const heatmap: Record<string, number> = {};
      for (const r of heat ?? []) heatmap[r.day] = (heatmap[r.day] ?? 0) + r.weight;

      const games: AppState["games"] = {};
      for (const s of scores ?? []) {
        const cur = games[s.game] ?? { level: 0, score: 0 };
        games[s.game] = { level: Math.max(cur.level, s.level), score: Math.max(cur.score, s.score) };
      }

      return {
        profile: profile
          ? {
              displayName: profile.display_name,
              theme: profile.theme as AppState["profile"]["theme"],
              skin: profile.skin as AppState["profile"]["skin"],
              wallpaperId: profile.wallpaper_id,
              onboardingDone: profile.onboarding_done,
              reduceEffects: profile.reduce_effects,
            }
          : undefined,
        nodes: Object.fromEntries(
          (nodes ?? []).map((n) => [
            n.node_id,
            {
              state: n.state as AppState["nodes"][string]["state"],
              level: n.node_level as AppState["nodes"][string]["level"],
              topicId: n.topic_id,
              startedAt: n.started_at,
              completedAt: n.completed_at,
            },
          ]),
        ),
        xpTotal: (xp ?? []).reduce((t, e) => t + e.amount, 0),
        heatmap,
        dailyLog: Object.fromEntries(
          (log ?? []).map((l) => [l.day, { body: l.body, nodeTag: l.node_tag, locked: l.locked }]),
        ),
        notes: Object.fromEntries((notes ?? []).map((n) => [n.node_id, n.body])),
        chapterReads: Object.fromEntries((reads ?? []).map((r) => [r.chapter_slug, r.read_at])),
        bookmarks: (marks ?? []).map((m) => m.chapter_slug),
        videoWatches: Object.fromEntries(
          (watches ?? []).map((w) => [w.video_id, { watchedAt: w.watched_at, note: w.note }]),
        ),
        watchQueue: (queue ?? []).map((q) => q.video_id),
        cases: Object.fromEntries(
          (cases ?? []).map((c) => [
            c.case_id,
            {
              status: c.status as CaseState["status"],
              body: c.body,
              startedAt: c.started_at,
              submittedAt: c.submitted_at,
              pmAiResponse: c.pm_ai_response,
            },
          ]),
        ),
        games,
        review: (review ?? []).map((r) => ({
          id: r.id,
          nodeId: r.node_id,
          concept: r.concept,
          ease: r.ease,
          intervalDays: r.interval_days,
          reps: r.reps,
          dueOn: r.due_on,
          lastReviewedAt: r.last_reviewed_at,
        })),
        toolInstalls: (tools ?? []).map((t) => t.tool_id),
        declineCount: (declines ?? []).length,
      };
    },

    async commit(action, next) {
      switch (action.type) {
        case "setTheme":
        case "setSkin":
        case "setWallpaper":
        case "setDisplayName":
        case "setReduceEffects":
        case "completeOnboarding":
          await mine(
            sb.from("profiles").update({
              display_name: next.profile.displayName,
              theme: next.profile.theme,
              skin: next.profile.skin,
              wallpaper_id: next.profile.wallpaperId,
              onboarding_done: next.profile.onboardingDone,
              reduce_effects: next.profile.reduceEffects,
            }).eq("id", userId),
          );
          if (action.type === "completeOnboarding") {
            await mine(
              sb.from("node_progress").upsert(
                action.seededNodeIds.map((id) => ({
                  user_id: userId,
                  node_id: id,
                  node_level: "sub",
                  state: "completed",
                  completed_at: new Date().toISOString(),
                })),
                { onConflict: "user_id,node_id" },
              ),
            );
          }
          return;

        case "startNode":
        case "completeNode": {
          const p = next.nodes[action.nodeId];
          await mine(
            sb.from("node_progress").upsert(
              {
                user_id: userId,
                node_id: action.nodeId,
                node_level: p.level,
                topic_id: p.topicId,
                state: p.state,
                started_at: p.startedAt,
                completed_at: p.completedAt,
              },
              { onConflict: "user_id,node_id" },
            ),
          );
          if (action.type === "completeNode") {
            await addXp(action.level === "topic" ? "topic_node_completed" : "sub_node_completed",
              action.level === "topic" ? XP.topic_node_completed : XP.sub_node_completed);
            await addHeat("node_complete");
            if (action.alsoCompleteTopic) {
              const tp = next.nodes[action.alsoCompleteTopic];
              await mine(
                sb.from("node_progress").upsert(
                  {
                    user_id: userId,
                    node_id: action.alsoCompleteTopic,
                    node_level: "topic",
                    state: "completed",
                    started_at: tp.startedAt,
                    completed_at: tp.completedAt,
                  },
                  { onConflict: "user_id,node_id" },
                ),
              );
              await addXp("topic_node_completed", XP.topic_node_completed);
              await addHeat("node_complete");
            }
          }
          return;
        }

        case "writeDailyLog": {
          const existed = action.day in next.dailyLog && false; // recompute below
          const before = await mine(
            sb.from("daily_log").select("id").eq("user_id", userId).eq("day", action.day).maybeSingle(),
          );
          await mine(
            sb.from("daily_log").upsert(
              { user_id: userId, day: action.day, body: action.body, node_tag: action.nodeTag },
              { onConflict: "user_id,day" },
            ),
          );
          if (!before && !existed) {
            await addXp("daily_log", XP.daily_log);
            await addHeat("daily_log");
          }
          return;
        }

        case "saveNote":
          await mine(
            sb.from("notes").upsert(
              { user_id: userId, node_id: action.nodeId, body: action.body },
              { onConflict: "user_id,node_id" },
            ),
          );
          return;

        case "readChapter":
          await mine(
            sb.from("chapter_reads").upsert(
              { user_id: userId, chapter_slug: action.slug, book: action.book },
              { onConflict: "user_id,chapter_slug", ignoreDuplicates: true },
            ),
          );
          await addXp("chapter_read", XP.chapter_read);
          await addHeat("review");
          return;

        case "toggleBookmark": {
          const on = next.bookmarks.includes(action.slug);
          if (on) {
            await mine(sb.from("bookmarks").upsert({ user_id: userId, chapter_slug: action.slug }, { onConflict: "user_id,chapter_slug" }));
          } else {
            await mine(sb.from("bookmarks").delete().eq("user_id", userId).eq("chapter_slug", action.slug));
          }
          return;
        }

        case "markVideoWatched": {
          const isNew = !(action.videoId in (await loadWatchIds(sb, userId)));
          await mine(
            sb.from("video_watches").upsert(
              { user_id: userId, video_id: action.videoId, note: action.note },
              { onConflict: "user_id,video_id" },
            ),
          );
          await mine(sb.from("watch_queue").delete().eq("user_id", userId).eq("video_id", action.videoId));
          if (isNew) {
            await addXp("video_watched", XP.video_watched);
            await addHeat("video");
          }
          return;
        }

        case "toggleWatchQueue": {
          const on = next.watchQueue.includes(action.videoId);
          if (on) {
            await mine(sb.from("watch_queue").upsert({ user_id: userId, video_id: action.videoId }, { onConflict: "user_id,video_id" }));
          } else {
            await mine(sb.from("watch_queue").delete().eq("user_id", userId).eq("video_id", action.videoId));
          }
          return;
        }

        case "startCase":
        case "submitCase":
        case "completeCase": {
          const c = next.cases[action.caseId];
          await mine(
            sb.from("case_submissions").upsert(
              {
                user_id: userId,
                case_id: action.caseId,
                status: c.status,
                body: c.body,
                started_at: c.startedAt,
                submitted_at: c.submittedAt,
                pm_ai_response: c.pmAiResponse as never,
              },
              { onConflict: "user_id,case_id" },
            ),
          );
          if (action.type === "startCase") {
            await addXp("case_started", XP.case_started);
            await addHeat("case_start");
          }
          if (action.type === "submitCase") {
            await addXp("case_submitted", XP.case_submitted);
            await addHeat("case_submit");
          }
          if (action.type === "completeCase") {
            if (action.reviewAccepted && !action.override) await addXp("pm_ai_review_accepted", XP.pm_ai_review_accepted);
            if (action.override) {
              await mine(
                sb.from("pm_ai_declines").insert({
                  user_id: userId,
                  kind: "override",
                  prompt_summary: `Marked case ${action.caseId} complete over PM-AI review`,
                  case_id: action.caseId,
                }),
              );
            }
          }
          return;
        }

        case "recordGameScore":
          await mine(
            sb.from("game_scores").insert({
              user_id: userId,
              game: action.game,
              level: action.level,
              score: action.score,
            }),
          );
          await addXp("game_level", XP.game_level);
          await addHeat("game");
          return;

        case "recordGameAttempt":
          await mine(
            sb.from("game_attempts").insert({
              user_id: userId,
              game: action.game,
              level: action.level,
              passed: action.passed,
            }),
          );
          return;

        case "answerReview": {
          const item = next.review.find((r) => r.id === action.itemId);
          if (!item) return;
          await mine(
            sb.from("review_items").upsert(
              {
                id: item.id,
                user_id: userId,
                node_id: item.nodeId,
                concept: item.concept,
                ease: item.ease,
                interval_days: item.intervalDays,
                reps: item.reps,
                due_on: item.dueOn,
                last_reviewed_at: item.lastReviewedAt,
              },
              { onConflict: "user_id,node_id,concept" },
            ),
          );
          await addXp("review_answered", XP.review_answered);
          await addHeat("review");
          return;
        }

        case "addReviewItems":
          await mine(
            sb.from("review_items").upsert(
              next.review
                .filter((r) => action.items.some((a) => a.nodeId === r.nodeId && a.concept === r.concept))
                .map((r) => ({
                  user_id: userId,
                  node_id: r.nodeId,
                  concept: r.concept,
                  ease: r.ease,
                  interval_days: r.intervalDays,
                  reps: r.reps,
                  due_on: r.dueOn,
                })),
              { onConflict: "user_id,node_id,concept", ignoreDuplicates: true },
            ),
          );
          return;

        case "setToolInstalled": {
          if (action.installed) {
            await mine(sb.from("tool_installs").upsert({ user_id: userId, tool_id: action.toolId }, { onConflict: "user_id,tool_id", ignoreDuplicates: true }));
            await addXp("tool_installed", XP.tool_installed);
            await addHeat("tool_install");
          } else {
            await mine(sb.from("tool_installs").delete().eq("user_id", userId).eq("tool_id", action.toolId));
          }
          return;
        }

        case "logCanvasSession":
          if (action.minutes < 2) return;
          await addXp("canvas_session", XP.canvas_session);
          await addHeat("canvas");
          return;

        case "logDecline":
          await mine(
            sb.from("pm_ai_declines").insert({
              user_id: userId,
              kind: action.kind,
              prompt_summary: "(logged from client)",
            }),
          );
          return;

        case "resetProgress": {
          const tables = [
            "node_progress",
            "xp_events",
            "heatmap_activity",
            "daily_log",
            "notes",
            "chapter_reads",
            "bookmarks",
            "video_watches",
            "watch_queue",
            "case_submissions",
            "game_scores",
            "game_attempts",
            "review_items",
            "tool_installs",
            "pm_ai_declines",
            "pm_ai_messages",
            "canvases",
            "diagnostic_results",
          ] as const;
          await Promise.all(tables.map((t) => mine(sb.from(t).delete().eq("user_id", userId))));
          return;
        }

        case "hydrate":
          return;
      }
    },
  };
}

async function loadWatchIds(sb: DB, userId: string): Promise<Record<string, true>> {
  const { data } = await sb.from("video_watches").select("video_id").eq("user_id", userId);
  return Object.fromEntries((data ?? []).map((r) => [r.video_id, true as const]));
}
