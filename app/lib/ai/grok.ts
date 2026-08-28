/* ============================================================================
   Grok (xAI) implementation of Advisor. xAI's API is OpenAI-compatible, so the
   HTTP shape here is the same one Anthropic-compatible or OpenAI providers use
   — a future provider is a copy of this file with a different base URL / model.

   Server-only: the API key never reaches the browser. Calls go through the
   /api/pm-ai route (step 17).
   ========================================================================== */
import "server-only";
import { serverEnv } from "@/lib/env.server";
import {
  contextBlock,
  SYSTEM_PROMPT,
} from "./system-prompt.v1";
import {
  AdvisorUnavailableError,
  type Advisor,
  type AdvisorReply,
  type ChatMessage,
  type LearnerContext,
  type ReviewRequest,
  type ReviewResult,
} from "./types";

const BASE_URL = process.env.GROK_BASE_URL ?? "https://api.x.ai/v1";
const MODEL = process.env.GROK_MODEL ?? "grok-3-mini";

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

async function complete(
  messages: ChatCompletionMessage[],
  opts: { json?: boolean; maxTokens?: number } = {},
): Promise<string> {
  if (!serverEnv.grokApiKey) {
    throw new AdvisorUnavailableError("GROK_API_KEY is not set");
  }
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serverEnv.grokApiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages,
        temperature: 0.4,
        max_tokens: opts.maxTokens ?? 500,
        ...(opts.json ? { response_format: { type: "json_object" } } : {}),
      }),
    });
  } catch (e) {
    throw new AdvisorUnavailableError("could not reach the advisor", e);
  }
  if (res.status === 429) throw new AdvisorUnavailableError("advisor is rate-limited");
  if (!res.ok) {
    throw new AdvisorUnavailableError(`advisor error ${res.status}`, await res.text().catch(() => ""));
  }
  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new AdvisorUnavailableError("empty advisor response");
  return content.trim();
}

function ctxMsg(ctx: LearnerContext): ChatCompletionMessage {
  return {
    role: "user",
    content: contextBlock({
      displayName: ctx.displayName,
      activeNode: ctx.activeNode,
      xpTotal: ctx.xpTotal,
      streakDays: ctx.streakDays,
      nodesCompleted: ctx.nodesCompleted,
      nodesTotal: ctx.nodesTotal,
      casesComplete: ctx.casesComplete,
      casesTotal: ctx.casesTotal,
      recentSubmissions: ctx.recentSubmissions,
      declineCount: ctx.declineCount,
    }),
  };
}

export const grokAdvisor: Advisor = {
  async review(req: ReviewRequest, ctx: LearnerContext): Promise<ReviewResult> {
    const raw = await complete(
      [
        { role: "system", content: SYSTEM_PROMPT },
        ctxMsg(ctx),
        {
          role: "user",
          content: `Review this case submission. Respond as JSON only.

CASE: ${req.caseTitle}
BRIEF: ${req.caseBrief}

SUBMISSION:
${req.submission}`,
        },
      ],
      { json: true, maxTokens: 400 },
    );
    let parsed: Partial<ReviewResult>;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new AdvisorUnavailableError("advisor returned malformed review");
    }
    return {
      strength: parsed.strength ?? "",
      gap: parsed.gap ?? "The submission needs a clearer statement of the finding.",
      question: parsed.question ?? "What is the single number a decision-maker takes from this?",
    };
  },

  async chat(messages: ChatMessage[], ctx: LearnerContext): Promise<AdvisorReply> {
    const content = await complete(
      [
        { role: "system", content: SYSTEM_PROMPT },
        ctxMsg(ctx),
        ...messages.map((m) => ({ role: m.role, content: m.content }) as ChatCompletionMessage),
      ],
      { maxTokens: 400 },
    );
    if (/^that is outside what i will help with here\.?/i.test(content)) {
      return { kind: "decline", reason: content };
    }
    return { kind: "reply", content };
  },

  async suggestNext(ctx: LearnerContext): Promise<string> {
    return complete(
      [
        { role: "system", content: SYSTEM_PROMPT },
        ctxMsg(ctx),
        { role: "user", content: "What should I focus on next? One sentence." },
      ],
      { maxTokens: 120 },
    );
  },
};
