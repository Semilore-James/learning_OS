/* ============================================================================
   PM-AI — the Advisor interface. You integrate this interface, not a vendor.
   Grok (xAI) implements it today; swapping to Anthropic/OpenAI is one new file
   plus an env var, with nothing else in the app changed.

   Operating mandate (PRD section 9) lives in system-prompt.v1.ts and is applied
   by every implementation.
   ========================================================================== */

/** Full learner history, assembled server-side and injected into every call.
 *  Grok keeps no state between calls, so this IS the memory. Nothing trimmed. */
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
  }>;
  declineCount: number;
  declines: Array<{ kind: string; summary: string; at: string }>;
}

export interface ReviewRequest {
  caseId: string;
  caseTitle: string;
  /** the scenario + deliverable text the learner was working from */
  caseBrief: string;
  submission: string;
}

/** Fixed schema for a case review (PRD 18.3: "strength, gap, question"). */
export interface ReviewResult {
  strength: string;
  gap: string;
  question: string;
}

export interface ChatMessage {
  role: "user" | "assistant";
  content: string;
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
