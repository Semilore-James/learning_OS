/* ============================================================================
   getAdvisor() — picks the implementation by env. Default groq. Swapping to a
   paid provider at launch (PRD 18.3) is: add `anthropic.ts` implementing
   Advisor, register it here, set AI_PROVIDER=anthropic. Nothing else changes.
   ========================================================================== */
import "server-only";
import { groqAdvisor } from "./groq";
import type { Advisor } from "./types";

const PROVIDER = process.env.AI_PROVIDER ?? "groq";

const REGISTRY: Record<string, Advisor> = {
  groq: groqAdvisor,
  // anthropic: anthropicAdvisor,
  // openai: openaiAdvisor,
};

export function getAdvisor(): Advisor {
  return REGISTRY[PROVIDER] ?? groqAdvisor;
}

export { buildContext } from "./context";
export {
  readMemory,
  injectMemory,
  recordPointer,
  noteUnresolved,
  resolveForCase,
  refreshNotes,
} from "./memory";
export { checkAndRecord, usageSnapshot, type UsageKind } from "./usage";
export { PROMPT_VERSION } from "./system-prompt.v2";
export {
  AdvisorUnavailableError,
  type Advisor,
  type AdvisorReply,
  type ChatMessage,
  type CsvDigest,
  type LearnerContext,
  type PmFacts,
  type PmMemory,
  type ReviewRequest,
  type ReviewResult,
} from "./types";
