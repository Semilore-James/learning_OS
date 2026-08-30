/* ============================================================================
   Pure reducer. No I/O. The provider runs this optimistically, then persist.ts
   mirrors the same action to the backing store.
   ========================================================================== */
import { XP, COINS, HEATMAP_WEIGHT } from "@/content/xp";
import type { Action, AppState, CaseState, ReviewItem } from "./types";
import { EMPTY_STATE } from "./types";
import { schedule } from "./srs";

export function todayUTC(): string {
  return new Date().toISOString().slice(0, 10);
}

function bump(state: AppState, xp: number): AppState {
  return { ...state, xpTotal: state.xpTotal + xp };
}

/** add cosmetic coins (never negative; spending is a separate path) */
function coin(state: AppState, amount: number): AppState {
  const add = Math.max(0, Math.round(amount));
  if (add === 0) return state;
  return { ...state, coins: { ...state.coins, earned: state.coins.earned + add } };
}

/** consecutive days with activity ending yesterday, for the streak-day bonus */
function priorStreak(heatmap: Record<string, number>, day: string): number {
  let n = 0;
  let d = new Date(day + "T00:00:00Z").getTime() - 86_400_000;
  while ((heatmap[new Date(d).toISOString().slice(0, 10)] ?? 0) > 0) {
    n++;
    d -= 86_400_000;
  }
  return n;
}

function heat(state: AppState, source: keyof typeof HEATMAP_WEIGHT): AppState {
  const day = todayUTC();
  const w = HEATMAP_WEIGHT[source];
  const firstToday = (state.heatmap[day] ?? 0) === 0 && state.coins.lastStreakDay !== day;
  let next: AppState = {
    ...state,
    heatmap: { ...state.heatmap, [day]: (state.heatmap[day] ?? 0) + w },
  };
  if (firstToday) {
    const award = COINS.streak_day_base + Math.min(priorStreak(next.heatmap, day), COINS.streak_day_cap);
    next = {
      ...next,
      coins: { ...next.coins, earned: next.coins.earned + award, lastStreakDay: day },
    };
  }
  return next;
}

export function reducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case "hydrate": {
      const merged: AppState = {
        ...EMPTY_STATE,
        ...action.state,
        mode: action.mode,
        ready: true,
        profile: { ...EMPTY_STATE.profile, ...action.state.profile },
      };
      // pre-coins state: seed the wallet from the old per-game score total
      if (!action.state.coins) {
        const legacy = Object.values(merged.games).reduce((t, g) => t + (g.score ?? 0), 0);
        merged.coins = { earned: legacy, spent: 0, lastStreakDay: null };
      }
      if (!action.state.unlocks) merged.unlocks = [];
      // onboarding phase back-fill + fail-safe: anyone with real history or the
      // old done flag skips the first-run flow entirely
      const hadHistory =
        merged.profile.onboardingDone ||
        merged.xpTotal > 0 ||
        Object.keys(merged.nodes).length > 0 ||
        Object.keys(merged.chapterReads).length > 0;
      if (!action.state.profile?.onboardingPhase) {
        merged.profile.onboardingPhase = hadHistory ? "done" : "mission";
      }
      merged.profile.onboardingDone = merged.profile.onboardingPhase === "done";
      return merged;
    }

    case "setTheme":
      return { ...state, profile: { ...state.profile, theme: action.theme } };

    case "setSkin":
      return { ...state, profile: { ...state.profile, skin: action.skin } };

    case "setWallpaper":
      return { ...state, profile: { ...state.profile, wallpaperId: action.wallpaperId } };

    case "setReduceEffects":
      return { ...state, profile: { ...state.profile, reduceEffects: action.reduceEffects } };

    case "setDisplayName":
      return { ...state, profile: { ...state.profile, displayName: action.displayName } };

    case "setHandle":
      return { ...state, profile: { ...state.profile, handle: action.handle } };

    case "setSharePublic":
      return { ...state, profile: { ...state.profile, sharePublic: action.sharePublic } };

    case "completeOnboarding": {
      const nodes = { ...state.nodes };
      for (const id of action.seededNodeIds) {
        nodes[id] = { state: "completed", level: "sub", topicId: null, startedAt: null, completedAt: new Date().toISOString() };
      }
      // calibration done -> hand off to the orientation beat
      return { ...state, nodes, profile: { ...state.profile, onboardingPhase: "orientation" } };
    }

    case "advanceOnboarding": {
      const done = action.to === "done";
      return {
        ...state,
        profile: { ...state.profile, onboardingPhase: action.to, onboardingDone: done },
      };
    }

    case "completeFirstMission": {
      let next = bump(state, XP.first_mission);
      next = coin(next, COINS.first_mission);
      next = heat(next, "case_submit");
      return { ...next, profile: { ...next.profile, onboardingPhase: "calibration" } };
    }

    case "startNode":
      return {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            state: "active",
            level: action.level,
            topicId: action.topicId,
            startedAt: new Date().toISOString(),
            completedAt: null,
          },
        },
      };

    case "completeNode": {
      const now = new Date().toISOString();
      let next: AppState = {
        ...state,
        nodes: {
          ...state.nodes,
          [action.nodeId]: {
            state: "completed",
            level: action.level,
            topicId: action.topicId,
            startedAt: state.nodes[action.nodeId]?.startedAt ?? now,
            completedAt: now,
          },
        },
      };
      next = bump(next, action.level === "topic" ? XP.topic_node_completed : XP.sub_node_completed);
      next = coin(next, action.level === "topic" ? COINS.topic_node_completed : COINS.sub_node_completed);
      next = heat(next, "node_complete");
      if (action.alsoCompleteTopic) {
        next = {
          ...next,
          nodes: {
            ...next.nodes,
            [action.alsoCompleteTopic]: {
              state: "completed",
              level: "topic",
              topicId: null,
              startedAt: next.nodes[action.alsoCompleteTopic]?.startedAt ?? now,
              completedAt: now,
            },
          },
        };
        next = bump(next, XP.topic_node_completed);
        next = coin(next, COINS.topic_node_completed);
        next = heat(next, "node_complete");
      }
      return next;
    }

    case "writeDailyLog": {
      const existed = !!state.dailyLog[action.day];
      let next: AppState = {
        ...state,
        dailyLog: {
          ...state.dailyLog,
          [action.day]: { body: action.body, nodeTag: action.nodeTag, locked: false },
        },
      };
      if (!existed) {
        next = bump(next, XP.daily_log);
        next = heat(next, "daily_log");
      }
      return next;
    }

    case "saveNote":
      return { ...state, notes: { ...state.notes, [action.nodeId]: action.body } };

    case "readChapter": {
      if (state.chapterReads[action.slug]) return state;
      let next: AppState = {
        ...state,
        chapterReads: { ...state.chapterReads, [action.slug]: new Date().toISOString() },
      };
      next = bump(next, XP.chapter_read);
      next = coin(next, COINS.chapter_read);
      next = heat(next, "review"); // chapter read = weight 1, same as review
      return next;
    }

    case "toggleBookmark": {
      const on = !state.bookmarks.includes(action.slug);
      return {
        ...state,
        bookmarks: on
          ? [...state.bookmarks, action.slug]
          : state.bookmarks.filter((s) => s !== action.slug),
      };
    }

    case "markVideoWatched": {
      if (state.videoWatches[action.videoId]) {
        return {
          ...state,
          videoWatches: {
            ...state.videoWatches,
            [action.videoId]: { ...state.videoWatches[action.videoId], note: action.note },
          },
        };
      }
      let next: AppState = {
        ...state,
        videoWatches: {
          ...state.videoWatches,
          [action.videoId]: { watchedAt: new Date().toISOString(), note: action.note },
        },
        watchQueue: state.watchQueue.filter((v) => v !== action.videoId),
      };
      next = bump(next, XP.video_watched);
      next = heat(next, "video");
      return next;
    }

    case "toggleWatchQueue": {
      const on = !state.watchQueue.includes(action.videoId);
      return {
        ...state,
        watchQueue: on
          ? [...state.watchQueue, action.videoId]
          : state.watchQueue.filter((v) => v !== action.videoId),
      };
    }

    case "startCase": {
      if (state.cases[action.caseId]) return state;
      const c: CaseState = {
        status: "in_progress",
        body: "",
        startedAt: new Date().toISOString(),
        submittedAt: null,
        pmAiResponse: null,
      };
      let next: AppState = { ...state, cases: { ...state.cases, [action.caseId]: c } };
      next = bump(next, XP.case_started);
      next = heat(next, "case_start");
      return next;
    }

    case "submitCase": {
      const prev = state.cases[action.caseId];
      if (!prev) return state;
      const firstSubmit = prev.status === "in_progress";
      let next: AppState = {
        ...state,
        cases: {
          ...state.cases,
          [action.caseId]: {
            ...prev,
            status: "submitted",
            body: action.body,
            submittedAt: new Date().toISOString(),
            pmAiResponse: action.pmAiResponse,
          },
        },
      };
      if (firstSubmit) {
        next = bump(next, XP.case_submitted);
        next = heat(next, "case_submit");
      }
      return next;
    }

    case "completeCase": {
      const prev = state.cases[action.caseId];
      if (!prev) return state;
      let next: AppState = {
        ...state,
        cases: {
          ...state.cases,
          [action.caseId]: {
            ...prev,
            status: action.override ? "complete_override" : "complete",
          },
        },
      };
      // one coin award per case, whichever way it completes (not repeatable)
      const alreadyDone = prev.status === "complete" || prev.status === "complete_override";
      if (!alreadyDone) {
        next = coin(next, action.override ? COINS.case_overridden : COINS.case_accepted);
      }
      if (action.reviewAccepted && !action.override) {
        next = bump(next, XP.pm_ai_review_accepted);
      }
      if (action.override) {
        next = { ...next, declineCount: next.declineCount + 1 };
      }
      return next;
    }

    case "recordGameScore": {
      const prev = state.games[action.game] ?? { level: 0, score: 0, attempts: 0, wins: 0, streak: 0, bestStreak: 0 };
      const newLevel = action.level > prev.level;
      // points: a new level is worth more the further you are; a re-clear is a nibble
      const points = newLevel ? 10 + action.level * 2 : 3;
      let next: AppState = {
        ...state,
        games: {
          ...state.games,
          [action.game]: {
            ...prev,
            level: Math.max(prev.level, action.level),
            score: prev.score + points,
          },
        },
      };
      next = coin(next, points); // same amount as the per-game score, into the wallet
      if (newLevel) {
        next = bump(next, XP.game_level);
        next = heat(next, "game");
      }
      return next;
    }

    case "recordGameAttempt": {
      const prev = state.games[action.game] ?? { level: 0, score: 0, attempts: 0, wins: 0, streak: 0, bestStreak: 0 };
      const streak = action.passed ? prev.streak + 1 : 0;
      return {
        ...state,
        games: {
          ...state.games,
          [action.game]: {
            ...prev,
            attempts: prev.attempts + 1,
            wins: prev.wins + (action.passed ? 1 : 0),
            streak,
            bestStreak: Math.max(prev.bestStreak, streak),
          },
        },
      };
    }

    case "answerReview": {
      const idx = state.review.findIndex((r) => r.id === action.itemId);
      if (idx < 0) return state;
      const item = state.review[idx];
      const s = schedule(item, action.grade, todayUTC());
      const updated: ReviewItem = { ...item, ...s };
      const review = [...state.review];
      review[idx] = updated;
      let next: AppState = { ...state, review };
      next = bump(next, XP.review_answered);
      next = heat(next, "review");
      return next;
    }

    case "addReviewItems": {
      const today = todayUTC();
      const additions: ReviewItem[] = action.items
        .filter((a) => !state.review.some((r) => r.nodeId === a.nodeId && r.concept === a.concept))
        .map((a) => ({
          id: crypto.randomUUID(),
          nodeId: a.nodeId,
          concept: a.concept,
          ease: 2.5,
          intervalDays: 0,
          reps: 0,
          dueOn: today,
          lastReviewedAt: null,
        }));
      return { ...state, review: [...state.review, ...additions] };
    }

    case "setToolInstalled": {
      const on = action.installed;
      const already = state.toolInstalls.includes(action.toolId);
      let next: AppState = {
        ...state,
        toolInstalls: on
          ? already
            ? state.toolInstalls
            : [...state.toolInstalls, action.toolId]
          : state.toolInstalls.filter((t) => t !== action.toolId),
      };
      if (on && !already) {
        next = bump(next, XP.tool_installed);
        next = heat(next, "tool_install");
      }
      return next;
    }

    case "logCanvasSession": {
      if (action.minutes < 2) return state;
      let next = bump(state, XP.canvas_session);
      next = heat(next, "canvas");
      return next;
    }

    case "logDecline":
      return { ...state, declineCount: state.declineCount + 1 };

    case "resetProgress":
      // wipe learning progress, keep identity + appearance + onboarding flag
      return {
        ...EMPTY_STATE,
        ready: true,
        mode: state.mode,
        profile: state.profile,
      };

    default:
      return state;
  }
}
