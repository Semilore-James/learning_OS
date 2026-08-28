/* ============================================================================
   POST /api/pm-ai/chat — a turn of PM-AI conversation (PRD 9 / Userflow 8).
   Rate-limited. Returns { kind: "reply" | "decline", ... } or 503.
   ========================================================================== */
import { NextResponse } from "next/server";
import {
  getAdvisor,
  AdvisorUnavailableError,
  type ChatMessage,
  type LearnerContext,
} from "@/lib/ai";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  let body: { messages?: ChatMessage[]; context?: Partial<LearnerContext>; clientKey?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-12);
  if (messages.length === 0 || !messages[messages.length - 1]?.content?.trim()) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  const rl = await checkRateLimit(`chat:${body.clientKey ?? "anon"}`);
  if (!rl.success) {
    return NextResponse.json({ error: "You have sent a lot of messages. Give it a minute." }, { status: 429 });
  }

  const c = body.context ?? {};
  const ctx: LearnerContext = {
    displayName: c.displayName ?? null,
    activeNode: c.activeNode ?? null,
    xpTotal: c.xpTotal ?? 0,
    streakDays: c.streakDays ?? 0,
    nodesCompleted: c.nodesCompleted ?? 0,
    nodesTotal: c.nodesTotal ?? 0,
    casesComplete: c.casesComplete ?? 0,
    casesTotal: c.casesTotal ?? 20,
    recentSubmissions: c.recentSubmissions ?? [],
    declineCount: c.declineCount ?? 0,
    declines: c.declines ?? [],
  };

  try {
    const out = await getAdvisor().chat(messages, ctx);
    return NextResponse.json(out);
  } catch (e) {
    if (e instanceof AdvisorUnavailableError) {
      return NextResponse.json(
        { error: "PM-AI is not reachable right now. Try again shortly." },
        { status: 503 },
      );
    }
    console.error("[pm-ai/chat]", e);
    return NextResponse.json({ error: "chat failed" }, { status: 500 });
  }
}
