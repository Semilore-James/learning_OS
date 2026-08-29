/* ============================================================================
   App state — the FROZEN CONTRACT for all learner progress.
   ----------------------------------------------------------------------------
   Shape mirrors supabase/migrations/0001_init.sql. Every mutation goes through
   dispatch(); the reducer is pure; a StoreAdapter persists the change to the
   backing store (localStorage for guests, Supabase for accounts) behind one
   interface so no component knows which is live.

   Heavy, window-local data (full canvas docs, full PM-AI transcript) is NOT
   here — those windows load it on demand. This holds what the desktop shell,
   taskbar, constellation, heatmap, and drawers need reactively.
   ========================================================================== */

export type Theme = "dark" | "light";
export type Skin = "neobrutalism" | "swiss" | "glassmorphism";
export type NodeLevel = "topic" | "sub";
export type StoredNodeState = "available" | "active" | "completed";
export type CaseStatus =
  | "in_progress"
  | "submitted"
  | "complete"
  | "complete_override";
export type Game =
  | "sql_dojo"
  | "data_detective"
  | "pivot_puzzle"
  | "chart_critiquer";
export type DeclineKind = "decline" | "override" | "disagreement";

export interface NodeProgress {
  state: StoredNodeState;
  level: NodeLevel;
  topicId: string | null;
  startedAt: string | null;
  completedAt: string | null;
}

export interface DailyLogEntry {
  body: string;
  nodeTag: string | null;
  locked: boolean;
}

export interface CaseState {
  status: CaseStatus;
  body: string;
  startedAt: string;
  submittedAt: string | null;
  pmAiResponse: unknown | null;
}

export interface ReviewItem {
  id: string;
  nodeId: string;
  concept: string;
  ease: number;
  intervalDays: number;
  reps: number;
  dueOn: string; // YYYY-MM-DD
  lastReviewedAt: string | null;
}

export interface AppState {
  /** false until the adapter has hydrated */
  ready: boolean;
  mode: "guest" | "account";

  profile: {
    displayName: string | null;
    theme: Theme;
    skin: Skin;
    wallpaperId: string;
    onboardingDone: boolean;
    reduceEffects: boolean;
    /** URL slug for the public /share page; null until the learner sets one */
    handle: string | null;
    /** master switch for the public /share page (default off) */
    sharePublic: boolean;
  };

  /** node_id -> progress. Absence = locked/available is derived by lib/graph.ts */
  nodes: Record<string, NodeProgress>;

  xpTotal: number;

  /** 'YYYY-MM-DD' -> summed weight for that day */
  heatmap: Record<string, number>;

  /** day (YYYY-MM-DD) -> entry */
  dailyLog: Record<string, DailyLogEntry>;

  /** node_id -> note body */
  notes: Record<string, string>;

  /** chapter slug -> read_at ISO */
  chapterReads: Record<string, string>;
  bookmarks: string[];

  /** youtube video id -> watch record */
  videoWatches: Record<string, { watchedAt: string; note: string | null }>;
  watchQueue: string[];

  /** case_id -> state */
  cases: Record<string, CaseState>;

  /** game -> best level reached + best score */
  /** per game: highest level reached, running points, and attempt accuracy */
  games: Record<
    string,
    { level: number; score: number; attempts: number; wins: number; streak: number; bestStreak: number }
  >;

  review: ReviewItem[];

  toolInstalls: string[];

  /** count only; the full log is loaded by the PM-AI / Decline Log window */
  declineCount: number;
}

export const EMPTY_STATE: AppState = {
  ready: false,
  mode: "guest",
  profile: {
    displayName: null,
    theme: "dark",
    skin: "neobrutalism",
    wallpaperId: "starfield",
    onboardingDone: false,
    reduceEffects: false,
    handle: null,
    sharePublic: false,
  },
  nodes: {},
  xpTotal: 0,
  heatmap: {},
  dailyLog: {},
  notes: {},
  chapterReads: {},
  bookmarks: [],
  videoWatches: {},
  watchQueue: [],
  cases: {},
  games: {},
  review: [],
  toolInstalls: [],
  declineCount: 0,
};

/* ---------------------------------------------------------------- actions --- */

export type Action =
  | { type: "hydrate"; state: Partial<AppState>; mode: "guest" | "account" }
  | { type: "setTheme"; theme: Theme }
  | { type: "setSkin"; skin: Skin }
  | { type: "setWallpaper"; wallpaperId: string }
  | { type: "setDisplayName"; displayName: string }
  | { type: "setReduceEffects"; reduceEffects: boolean }
  | { type: "setHandle"; handle: string | null }
  | { type: "setSharePublic"; sharePublic: boolean }
  | { type: "completeOnboarding"; seededNodeIds: string[] }
  | { type: "resetProgress" }
  | { type: "startNode"; nodeId: string; level: NodeLevel; topicId: string | null }
  | { type: "completeNode"; nodeId: string; level: NodeLevel; topicId: string | null; alsoCompleteTopic?: string }
  | { type: "writeDailyLog"; day: string; body: string; nodeTag: string | null }
  | { type: "saveNote"; nodeId: string; body: string }
  | { type: "readChapter"; slug: string; book: string | null }
  | { type: "toggleBookmark"; slug: string }
  | { type: "markVideoWatched"; videoId: string; note: string | null }
  | { type: "toggleWatchQueue"; videoId: string }
  | { type: "startCase"; caseId: string }
  | { type: "submitCase"; caseId: string; body: string; pmAiResponse: unknown }
  | { type: "completeCase"; caseId: string; override: boolean; reviewAccepted: boolean }
  | { type: "recordGameScore"; game: Game; level: number; score: number }
  | { type: "recordGameAttempt"; game: Game; level: number; passed: boolean }
  | { type: "answerReview"; itemId: string; grade: 0 | 1 | 2 | 3 }
  | { type: "addReviewItems"; items: Array<Pick<ReviewItem, "nodeId" | "concept">> }
  | { type: "setToolInstalled"; toolId: string; installed: boolean }
  | { type: "logCanvasSession"; minutes: number }
  | { type: "logDecline"; kind: DeclineKind };

/* --------------------------------------------------------------- adapter --- */

/**
 * A backing store. `loadState` hydrates on start. `commit` mirrors ONE applied
 * action to the store — the reducer already computed `next`, the adapter just
 * writes the delta (localStorage: dump the blob; Supabase: targeted upserts).
 * Rejecting from `commit` tells the provider to roll back to `prev`.
 */
export interface StoreAdapter {
  loadState(): Promise<Partial<AppState>>;
  commit(action: Action, next: AppState, prev: AppState): Promise<void>;
}

/** keys that never persist (recomputed on hydrate) */
export const TRANSIENT_KEYS: ReadonlyArray<keyof AppState> = ["ready", "mode"];
