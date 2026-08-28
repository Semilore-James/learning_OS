/* ============================================================================
   getAdvisor() — picks the implementation by env. Default grok. Swapping to a
   paid provider at launch (PRD 18.3) is: add `anthropic.ts` implementing
   Advisor, register it here, set AI_PROVIDER=anthropic. Nothing else changes.
   ========================================================================== */
import "server-only";
import { grokAdvisor } from "./grok";
import type { Advisor } from "./types";

const PROVIDER = process.env.AI_PROVIDER ?? "grok";

const REGISTRY: Record<string, Advisor> = {
  grok: grokAdvisor,
  // anthropic: anthropicAdvisor,
  // openai: openaiAdvisor,
};

export function getAdvisor(): Advisor {
  return REGISTRY[PROVIDER] ?? grokAdvisor;
}

export { buildContext } from "./context";
export { PROMPT_VERSION } from "./system-prompt.v1";
export {
  AdvisorUnavailableError,
  type Advisor,
  type AdvisorReply,
  type ChatMessage,
  type LearnerContext,
  type ReviewRequest,
  type ReviewResult,
} from "./types";
