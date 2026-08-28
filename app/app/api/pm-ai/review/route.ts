/* ============================================================================
   POST /api/pm-ai/review — PM-AI reviews a case submission (PRD 9 / Userflow 7).
   Rate-limited per client. Returns { strength, gap, question } or 503 with a
   plain message the window shows ("advisor busy, your work is saved").

   Context: the client sends a lightweight snapshot (active node, xp, cases
   done). Once auth lands (step 5) this route will enrich it server-side from
   Supabase via buildContext(). The learner's submission is persisted client
   side BEFORE this call, so a failure here never loses work.
   ========================================================================== */
import { NextResponse } from "next/server";
import { getAdvisor, AdvisorUnavailableError, type LearnerContext } from "@/lib/ai";
import { checkRateLimit } from "@/lib/ratelimit";

export async function POST(req: Request) {
  let body: {
    caseId?: string;
    caseTitle?: string;
    caseBrief?: string;
    submission?: string;
    context?: Partial<LearnerContext>;
    clientKey?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "bad request" }, { status: 400 });
  }

  const { caseTitle, caseBrief, submission, context = {}, clientKey } = body;
  if (!submission || submission.trim().length < 20) {
    return NextResponse.json({ error: "write more before submitting" }, { status: 400 });
  }

  const rl = await checkRateLimit(`review:${clientKey ?? "anon"}`);
  if (!rl.success) {
    return NextResponse.json({ error: "You have sent a lot of reviews. Try again in a bit." }, { status: 429 });
  }

  const ctx: LearnerContext = {
    displayName: context.displayName ?? null,
    activeNode: context.activeNode ?? null,
    xpTotal: context.xpTotal ?? 0,
    streakDays: context.streakDays ?? 0,
    nodesCompleted: context.nodesCompleted ?? 0,
    nodesTotal: context.nodesTotal ?? 0,
    casesComplete: context.casesComplete ?? 0,
    casesTotal: context.casesTotal ?? 20,
    recentSubmissions: context.recentSubmissions ?? [],
    declineCount: context.declineCount ?? 0,
    declines: context.declines ?? [],
  };

  try {
    const result = await getAdvisor().review(
      {
        caseId: body.caseId ?? "",
        caseTitle: caseTitle ?? "the case",
        caseBrief: caseBrief ?? "",
        submission,
      },
      ctx,
    );
    return NextResponse.json(result);
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
