/* ============================================================================
   PM-AI — the Advisor interface. You integrate this interface, not a vendor.
   Groq implements it today; swapping to Anthropic/OpenAI is one new file plus
   an env var, with nothing else in the app changed.

   Operating mandate (PRD section 9) lives in system-prompt.v2.ts and is applied
   by every implementation.
   ========================================================================== */

/** Full learner history, assembled server-side and injected into every call.
 *  The model keeps no state between calls, so this IS the memory. Nothing trimmed. */
export interface LearnerContext {
  displayName: string | null;
  activeNode: { id: string; label: string; topic: string } | null;
  xpTotal: number;
  streakDays: number;
  nodesCompleted: number;
  nodesTotal: number;
  casesComplete: number;
  casesTotal: number;
  recentSubmissions: Array<{
    caseId: string;
    title: string;
    status: string;
    body: string;
    submittedAt: string | null;
    /** the PM's own last review of this submission, if any */
    lastReview: ReviewResult | null;
  }>;
  declineCount: number;
  declines: Array<{ kind: string; summary: string; at: string }>;
  /** the PM's running dense notes on this learner (pm_ai_memory.doc).
   *  "" for guests or a brand-new learner. Injected as the MEMORY block. */
  memoryDoc: string;
}

/** A deterministic summary of a learner's cleaned CSV, computed in the browser
 *  (lib/casefiles/csvDigest.ts). The raw file never leaves the client. */
export interface CsvDigest {
  fileName: string;
  rowCount: number;
  /** true when the digest was computed on a capped prefix of a large file */
  truncated: boolean;
  duplicateRows: number;
  columns: Array<{
    name: string;
    type: "number" | "date" | "text" | "bool";
    /** 0-100, rounded */
    nullPct: number;
    sample: string[];
  }>;
}

/* ---------------------------------------------------------------- memory --- */

/** structured, code-owned facts — never written by a model. All arrays capped. */
export interface PmFacts {
  /** the one thread left hanging from last time */
  openQuestion: string | null;
  /** gaps the PM has named that the learner has not resolved (cap 6) */
  unresolved: Array<{
    gap: string;
    caseId: string | null;
    firstSeen: string;
    timesRaised: number;
  }>;
  /** in-app resources already recommended, so the PM does not repeat (cap 12, FIFO) */
  pointersGiven: Array<{ resource: string; at: string }>;
  /** daily-greeting quote ids already shown (cap 30, FIFO) */
  greetingsUsed: string[];
}

export const EMPTY_FACTS: PmFacts = {
  openQuestion: null,
  unresolved: [],
  pointersGiven: [],
  greetingsUsed: [],
};

export interface PmMemory {
  facts: PmFacts;
  /** freeform hyperdense markdown, model-owned, token-capped */
  notesMd: string;
}

export interface ReviewRequest {
  caseId: string;
  caseTitle: string;
  /** the scenario + deliverable text the learner was working from */
  caseBrief: string;
  submission: string;
  /** optional client-computed summary of their cleaned data file */
  digest?: CsvDigest | null;
}

/** Fixed schema for a case review. The verdict is the PM's call on whether the
 *  case can be marked complete: "accept" = the work was done and the finding
 *  holds (a gap is still named for next time); "revise" = the core work is
 *  missing, wrong, or unsupported and must be resubmitted. */
export interface ReviewResult {
  verdict: "accept" | "revise";
  strength: string;
  gap: string;
  question: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  /** data: URLs for screenshots the learner attached (last message only,
   *  gated by the pmVision flag). Routed to a vision-capable model. */
  images?: string[];
}

export type AdvisorReply =
  | { kind: "reply"; content: string }
  | { kind: "decline"; reason: string };

export interface Advisor {
  /** review a case submission — names what is missing, never how to fix it */
  review(req: ReviewRequest, ctx: LearnerContext): Promise<ReviewResult>;
  /** free chat within the mandate; may decline */
  chat(messages: ChatMessage[], ctx: LearnerContext): Promise<AdvisorReply>;
  /** one line: which node or case to do next, and why */
  suggestNext(ctx: LearnerContext): Promise<string>;
}

/** thrown when the provider is unreachable / rate-limited. The caller has
 *  already persisted the learner's work, so it just surfaces "try again". */
export class AdvisorUnavailableError extends Error {
  constructor(
    message: string,
    readonly cause?: unknown,
  ) {
    super(message);
    this.name = "AdvisorUnavailableError";
  }
}
