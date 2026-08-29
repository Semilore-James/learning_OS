/* ============================================================================
   Groq implementation of Advisor. Groq serves open models (Llama, GPT-OSS)
   behind an OpenAI-compatible API, so the HTTP shape here is the same one an
   Anthropic-compatible or OpenAI provider uses. A future provider is a copy of
   this file with a different base URL / model.

   Server-only: the API key never reaches the browser. Calls go through the
   /api/pm-ai routes.
   ========================================================================== */
import "server-only";
import { serverEnv } from "@/lib/env.server";
import {
  contextBlock,
  digestBlock,
  memoryBlock,
  SYSTEM_PROMPT,
} from "./system-prompt.v2";
import {
  AdvisorUnavailableError,
  type Advisor,
  type AdvisorReply,
  type ChatMessage,
  type LearnerContext,
  type ReviewRequest,
  type ReviewResult,
} from "./types";

const BASE_URL = process.env.GROQ_BASE_URL ?? "https://api.groq.com/openai/v1";
const MODEL = process.env.GROQ_MODEL ?? "openai/gpt-oss-120b";
/** empty = no vision provider wired; images are dropped and the turn runs
 *  text-only. Groq has no vision model on this account yet. */
const VISION_MODEL = process.env.GROQ_VISION_MODEL ?? "";
export const visionAvailable = Boolean(VISION_MODEL);

type ContentPart =
  | { type: "text"; text: string }
  | { type: "image_url"; image_url: { url: string } };

interface ChatCompletionMessage {
  role: "system" | "user" | "assistant";
  content: string | ContentPart[];
}

async function complete(
  messages: ChatCompletionMessage[],
  opts: { json?: boolean; maxTokens?: number; model?: string } = {},
): Promise<string> {
  if (!serverEnv.groqApiKey) {
    throw new AdvisorUnavailableError("GROQ_API_KEY is not set");
  }
  // GPT-OSS / Qwen3 on Groq are reasoning models: without a low effort setting
  // the reasoning trace eats the token budget and `content` comes back empty.
  const maxTokens = opts.maxTokens ?? 500;
  let res: Response;
  try {
    res = await fetch(`${BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "content-type": "application/json",
        authorization: `Bearer ${serverEnv.groqApiKey}`,
      },
      body: JSON.stringify({
        model: opts.model ?? MODEL,
        messages,
        temperature: 0.4,
        max_tokens: maxTokens + 512, // headroom for the reasoning trace
        reasoning_effort: "low",
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

/** CONTEXT + (when present) MEMORY, as one leading user turn. */
function contextMessages(ctx: LearnerContext): ChatCompletionMessage[] {
  const out: ChatCompletionMessage[] = [
    {
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
    },
  ];
  const mem = memoryBlock(ctx.memoryDoc);
  if (mem) out.push({ role: "user", content: mem });
  return out;
}

export const groqAdvisor: Advisor = {
  async review(req: ReviewRequest, ctx: LearnerContext): Promise<ReviewResult> {
    const parts = [
      `Review this case submission. Respond as JSON only.`,
      ``,
      `CASE: ${req.caseTitle}`,
      `BRIEF: ${req.caseBrief}`,
      ``,
      `SUBMISSION:`,
      req.submission,
    ];
    if (req.digest) parts.push(``, digestBlock(req.digest));

    const raw = await complete(
      [
        { role: "system", content: SYSTEM_PROMPT },
        ...contextMessages(ctx),
        { role: "user", content: parts.join("\n") },
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
    const useVision = visionAvailable && messages.some((m) => m.images && m.images.length > 0);
    const turns: ChatCompletionMessage[] = messages.map((m) => {
      if (useVision && m.role === "user" && m.images && m.images.length > 0) {
        return {
          role: "user",
          content: [
            { type: "text", text: m.content },
            ...m.images.slice(0, 1).map(
              (url): ContentPart => ({ type: "image_url", image_url: { url } }),
            ),
          ],
        };
      }
      // no vision provider: fall back to text, note the screenshot was dropped
      const note = m.images && m.images.length > 0 ? `${m.content}\n[a screenshot was attached but the PM cannot view images right now]` : m.content;
      return { role: m.role, content: note };
    });

    const content = await complete(
      [
        { role: "system", content: SYSTEM_PROMPT },
        ...contextMessages(ctx),
        ...turns,
      ],
      { maxTokens: 400, model: useVision ? VISION_MODEL : undefined },
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
        ...contextMessages(ctx),
        { role: "user", content: "What should I focus on next? One sentence." },
      ],
      { maxTokens: 120 },
    );
  },
};
