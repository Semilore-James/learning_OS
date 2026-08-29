/* ============================================================================
   POST /api/pm-ai/review — PM-AI reviews a case submission (PRD 9 / Userflow 7).

   Signed in: context + memory built server-side under the user's RLS session;
   per-user limit is the pm_ai_usage table; the named gap is tracked in the
   PM's memory (pm_ai_memory.facts.unresolved) so it can hold the learner to
   it later; notes refresh fire-and-forget.

   Guest: client context snapshot, Upstash fallback limiter, no memory.

   The learner's submission is persisted client-side BEFORE this call, so a
   failure here never loses work. Returns { strength, gap, question, ...meta }
   or 429 / 503.
   ========================================================================== */
import { NextResponse } from "next/server";
import {
  getAdvisor,
  buildContext,
  readMemory,
  injectMemory,
  noteUnresolved,
  resolveForCase,
  refreshNotes,
  checkAndRecord,
  AdvisorUnavailableError,
  type CsvDigest,
  type LearnerContext,
} from "@/lib/ai";
import { checkRateLimit } from "@/lib/ratelimit";
import { createClient } from "@/lib/supabase/server";
import { publicEnv } from "@/lib/env";

const supabaseConfigured = Boolean(publicEnv.supabaseUrl && publicEnv.supabaseAnonKey);

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

/** guard the client-computed digest shape before it enters the prompt */
function cleanDigest(raw: unknown): CsvDigest | null {
  if (!raw || typeof raw !== "object") return null;
  const d = raw as Record<string, unknown>;
  if (typeof d.fileName !== "string" || !Array.isArray(d.columns)) return null;
  const columns = d.columns
    .slice(0, 60)
    .map((c) => {
      const col = c as Record<string, unknown>;
      return {
        name: String(col.name ?? "").slice(0, 80),
        type: (["number", "date", "text", "bool"].includes(String(col.type))
          ? col.type
          : "text") as CsvDigest["columns"][number]["type"],
        nullPct: Math.max(0, Math.min(100, Math.round(Number(col.nullPct) || 0))),
        sample: Array.isArray(col.sample)
          ? col.sample.slice(0, 3).map((s) => String(s).slice(0, 60))
          : [],
      };
    });
  return {
    fileName: d.fileName.slice(0, 120),
    rowCount: Math.max(0, Math.round(Number(d.rowCount) || 0)),
    truncated: Boolean(d.truncated),
    duplicateRows: Math.max(0, Math.round(Number(d.duplicateRows) || 0)),
    columns,
  };
}

export async function POST(req: Request) {
  let body: {
    caseId?: string;
    caseTitle?: string;
    caseBrief?: string;
    submission?: string;
    digest?: unknown;
    context?: Partial<LearnerContext>;
    clientKey?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { caseId, caseTitle, caseBrief, submission, context = {}, clientKey } = body;
  if (!submission || submission.trim().length < 20) {
    return NextResponse.json({ error: "write more before submitting" }, { status: 400 });
  }
  const digest = cleanDigest(body.digest);

  const supabase = supabaseConfigured ? await createClient() : null;
  const user = supabase ? (await supabase.auth.getUser()).data.user : null;

  let ctx: LearnerContext;
  let remainingHour: number | null = null;
  let priorNotes = "";

  if (user && supabase) {
    const rl = await checkAndRecord(supabase, user.id, "review");
    if (!rl.ok) {
      return NextResponse.json(
        { error: "That is all the reviews I have time for this hour. Your submission is saved.", resetInSec: rl.resetInSec, remainingHour: 0 },
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
    const rl = await checkRateLimit(`review:guest:${clientKey ?? "anon"}`);
    if (!rl.success) {
      return NextResponse.json(
        { error: "You have sent a lot of reviews. Try again in a bit." },
        { status: 429 },
      );
    }
    ctx = fallbackContext(context);
  }

  try {
    const result = await getAdvisor().review(
      {
        caseId: caseId ?? "",
        caseTitle: caseTitle ?? "the case",
        caseBrief: caseBrief ?? "",
        submission,
        digest,
      },
      ctx,
    );

    if (user && supabase) {
      if (result.verdict === "revise") void noteUnresolved(supabase, user.id, result.gap, caseId ?? null);
      else void resolveForCase(supabase, user.id, caseId ?? "");
      void refreshNotes(
        supabase,
        user.id,
        { learner: `[submitted ${caseTitle ?? caseId}] ${submission}`, pm: JSON.stringify(result) },
        priorNotes,
      );
    }

    return NextResponse.json({ ...result, remainingHour });
  } catch (e) {
    if (e instanceof AdvisorUnavailableError) {
      return NextResponse.json(
        { error: "PM-AI is not reachable right now. Your submission is saved; try the review again shortly." },
        { status: 503 },
      );
    }
    console.error("[pm-ai/review]", e);
    return NextResponse.json({ error: "review failed" }, { status: 500 });
  }
}
