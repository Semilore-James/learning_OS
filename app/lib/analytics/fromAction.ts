/* ============================================================================
   Maps a dispatched store Action to zero or more analytics events (PRD 16.1).
   Called from StoreProvider's dispatch, the single chokepoint every state
   change passes through, so individual components never scatter track() calls
   for anything that is really a state transition.

   Milestone events (xp_milestone, streak_milestone) need a before/after diff
   and are emitted separately by an effect in StoreProvider.
   ========================================================================== */
import type { Action, AppState } from "@/lib/store/types";
import { VIDEOS } from "@/lib/video";
import { ITEMS_BY_ID } from "@/content/shop/items";
import { CASES } from "@/content/cases/registry";
import { chapterBySlug } from "@/content/textbook/registry";
import type { EventMap, EventName } from "./events";

type Ev = { [K in EventName]: { name: K; props: EventMap[K] } }[EventName];

export function eventsForAction(action: Action, next: AppState): Ev[] {
  switch (action.type) {
    case "startNode":
      return [
        {
          name: action.level === "sub" ? "sub_node_clicked" : "node_clicked",
          props:
            action.level === "sub"
              ? { topic: action.topicId ?? "", sub_node_name: action.nodeId, state: "active" }
              : { node_name: action.nodeId, node_level: "topic", node_state: "active" },
        } as Ev,
      ];

    case "completeNode":
      return [
        {
          name: "node_completed",
          props: { node_name: action.nodeId, topic: action.topicId ?? action.alsoCompleteTopic ?? "" },
        },
      ];

    case "markVideoWatched": {
      const v = VIDEOS.find((x) => x.id === action.videoId);
      return [
        {
          name: "video_watched",
          props: {
            video_id: action.videoId,
            channel: v?.channel ?? "",
            skill_tag: v?.skillTags?.[0] ?? "",
            duration_minutes: v?.durationSeconds ? Math.round(v.durationSeconds / 60) : 0,
          },
        },
      ];
    }

    case "startCase": {
      const c = CASES.find((x) => x.id === action.caseId);
      return [{ name: "case_started", props: { case_id: action.caseId, difficulty: c?.difficulty ?? "" } }];
    }

    case "submitCase": {
      const c = CASES.find((x) => x.id === action.caseId);
      const sub = next.cases?.[action.caseId];
      let days = 0;
      if (sub?.startedAt) {
        days = Math.max(0, Math.round((Date.now() - new Date(sub.startedAt).getTime()) / 86_400_000));
      }
      return [
        {
          name: "case_submitted",
          props: { case_id: action.caseId, difficulty: c?.difficulty ?? "", days_in_progress: days },
        },
      ];
    }

    case "recordGameScore":
      return [
        {
          name: "game_completed",
          props: { game_name: action.game, score: action.score, difficulty_level: action.level },
        },
      ];

    case "writeDailyLog":
      return [
        {
          name: "daily_log_written",
          props: { char_count: action.body.length, active_node: action.nodeTag },
        },
      ];

    case "logCanvasSession":
      return [{ name: "canvas_session", props: { canvas_name: "board", duration_minutes: action.minutes } }];

    case "readChapter": {
      const hit = chapterBySlug(action.slug);
      return [
        {
          name: "textbook_chapter_read",
          props: {
            book_title: hit?.book.title ?? action.book ?? "",
            chapter_title: hit?.chapter.title ?? action.slug,
          },
        },
      ];
    }

    case "setTheme":
      return [{ name: "theme_toggled", props: { new_theme: action.theme } }];
    case "setSkin":
      return [{ name: "skin_changed", props: { new_skin: action.skin } }];
    case "setWallpaper":
      return [{ name: "wallpaper_changed", props: { wallpaper_id: action.wallpaperId } }];

    case "setToolInstalled":
      return action.installed
        ? [{ name: "tool_installed", props: { tool_id: action.toolId } }]
        : [];

    case "logDecline":
      return [{ name: "pm_ai_declined", props: { decline_reason: action.kind } }];

    case "purchaseItem": {
      // only fires when the reducer actually granted it (the item is now owned)
      if (!next.unlocks.includes(action.itemId)) return [];
      const it = ITEMS_BY_ID[action.itemId];
      if (!it) return [];
      return [
        {
          name: "shop_item_purchased",
          props: { item_id: it.id, category: it.category, rarity: it.rarity, price: it.price },
        },
      ];
    }

    case "equip":
      return [
        { name: "shop_item_equipped", props: { slot: action.slot, item_id: action.itemId } },
      ];

    default:
      return [];
  }
}
