/* ============================================================================
   POST /api/pm-ai/chat — a turn of PM-AI conversation (PRD 9 / Userflow 8).

   Signed in: context + memory are built server-side from Supabase under the
   user's RLS session, the per-user rate limit is the pm_ai_usage table (and
   its count feeds the "PM's attention" bar), and the exchange updates the
   PM's memory notes fire-and-forget.

   Guest: the client sends a lightweight context snapshot, there is no memory,
   and the limiter falls back to the Upstash sliding window keyed by a
   localStorage guest id (a no-op locally, active once Upstash env is set).

   Returns { kind: "reply" | "decline", ...meta } or 429 / 503.
   ========================================================================== */
import { NextResponse } from "next/server";
import {
  getAdvisor,
  buildContext,
  readMemory,
  injectMemory,
  refreshNotes,
  checkAndRecord,
  AdvisorUnavailableError,
  type ChatMessage,
  type LearnerContext,
} from "@/lib/ai";
import { checkRateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { flag } from "@/lib/flags";

function fallbackContext(c: Partial<LearnerContext>): LearnerContext {
  return {
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
    memoryDoc: "",
  };
}

export async function POST(req: Request) {
  let body: {
    messages?: ChatMessage[];
    context?: Partial<LearnerContext>;
    clientKey?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const messages = (body.messages ?? []).slice(-12);
  const last = messages[messages.length - 1];
  if (messages.length === 0 || !last?.content?.trim()) {
    return NextResponse.json({ error: "empty message" }, { status: 400 });
  }

  // images: last message only, one max, gated by the pmVision flag server-side too
  const hasImage = Boolean(last.images && last.images.length > 0);
  if (hasImage && !flag("pmVision")) {
    last.images = undefined;
  }
  const usesImage = Boolean(last.images && last.images.length > 0);
  for (const m of messages.slice(0, -1)) m.images = undefined;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let ctx: LearnerContext;
  let remainingHour: number | null = null;
  let priorNotes = "";

  if (user) {
    const rl = await checkAndRecord(supabase, user.id, usesImage ? "chat_image" : "chat", usesImage ? 3 : 1);
    if (!rl.ok) {
      return NextResponse.json(
        { error: "That is my time for this hour. Your work is saved. Come back in a bit.", resetInSec: rl.resetInSec, remainingHour: 0 },
        { status: 429 },
      );
    }
    remainingHour = rl.remainingHour;
    const [built, mem] = await Promise.all([
      buildContext(supabase, user.id),
      readMemory(supabase, user.id),
    ]);
    ctx = built;
    ctx.memoryDoc = injectMemory(mem);
    priorNotes = mem.notesMd;
  } else {
    const rl = await checkRateLimit(`chat:guest:${body.clientKey ?? "anon"}`);
    if (!rl.success) {
      return NextResponse.json(
        { error: "You have sent a lot of messages. Give it a minute." },
        { status: 429 },
      );
    }
    ctx = fallbackContext(body.context ?? {});
  }

  try {
    const out = await getAdvisor().chat(messages, ctx);

    if (user) {
      const reply = out.kind === "reply" ? out.content : out.reason;
      // persist the visible pair (transcript store already exists from 0001)
      void supabase.from("pm_ai_messages").insert([
        { user_id: user.id, role: "user", content: last.content },
        { user_id: user.id, role: "assistant", content: reply },
      ]);
      // refresh the PM's dense notes, fire-and-forget
      void refreshNotes(supabase, user.id, { learner: last.content, pm: reply }, priorNotes);
    }

    return NextResponse.json({ ...out, remainingHour });
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
