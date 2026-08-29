/* ============================================================================
   buildContext — assembles the learner's full history for PM-AI, server-side,
   from Supabase. A pure-ish function: hand it a Supabase client bound to the
   user's session and their id, get back a LearnerContext. Testable by mocking
   the client; no global state.
   ========================================================================== */
import "server-only";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/supabase/database.types";
import { TOPICS, TOPICS_BY_ID } from "@/content/curriculum";
import type { LearnerContext, ReviewResult } from "./types";

type DB = SupabaseClient<Database>;

const SUB_NODE_TOTAL = TOPICS.reduce(
  (n, t) => n + (t.subNodes.length || (t.plannedSubNodes?.length ?? 0)),
  0,
);

// keep in sync with app/content/cases/ once authored
const CASE_TOTAL = 20;

function labelForNode(nodeId: string): { label: string; topic: string } | null {
  const topic = TOPICS_BY_ID[nodeId];
  if (topic) return { label: topic.label, topic: topic.label };
  for (const t of TOPICS) {
    const sub = t.subNodes.find((s) => s.id === nodeId);
    if (sub) return { label: sub.label, topic: t.label };
  }
  return null;
}

export async function buildContext(sb: DB, userId: string): Promise<LearnerContext> {
  const [profile, nodes, xp, heat, cases, declines] = await Promise.all([
    sb.from("profiles").select("display_name").eq("id", userId).maybeSingle(),
    sb.from("node_progress").select("node_id,node_level,state").eq("user_id", userId),
    sb.from("xp_events").select("amount").eq("user_id", userId),
    sb.from("heatmap_activity").select("day").eq("user_id", userId),
    sb
      .from("case_submissions")
      .select("case_id,status,body,submitted_at,pm_ai_response")
      .eq("user_id", userId)
      .order("updated_at", { ascending: false })
      .limit(5),
    sb.from("pm_ai_declines").select("kind,prompt_summary,created_at").eq("user_id", userId),
  ]);

  const nodeRows = nodes.data ?? [];
  const activeRow = nodeRows.find((n) => n.state === "active" && n.node_level === "sub");
  const activeMeta = activeRow ? labelForNode(activeRow.node_id) : null;

  // streak: consecutive days with activity ending today/yesterday
  const days = [...new Set((heat.data ?? []).map((r) => r.day))].sort();
  const dayMs = 86_400_000;
  const set = new Set(days);
  const today = Date.parse(new Date().toISOString().slice(0, 10));
  let streakDays = 0;
  let cursor = set.has(new Date(today).toISOString().slice(0, 10))
    ? today
    : today - dayMs;
  while (set.has(new Date(cursor).toISOString().slice(0, 10))) {
    streakDays++;
    cursor -= dayMs;
  }

  const caseRows = cases.data ?? [];

  const parseReview = (raw: unknown): ReviewResult | null => {
    if (!raw || typeof raw !== "object") return null;
    const r = raw as Record<string, unknown>;
    if (typeof r.gap !== "string" || typeof r.question !== "string") return null;
    return {
      verdict: r.verdict === "accept" ? "accept" : "revise",
      strength: typeof r.strength === "string" ? r.strength : "",
      gap: r.gap,
      question: r.question,
    };
  };

  return {
    displayName: profile.data?.display_name ?? null,
    activeNode: activeRow
      ? {
          id: activeRow.node_id,
          label: activeMeta?.label ?? activeRow.node_id,
          topic: activeMeta?.topic ?? "",
        }
      : null,
    xpTotal: (xp.data ?? []).reduce((t, e) => t + e.amount, 0),
    streakDays,
    nodesCompleted: nodeRows.filter((n) => n.state === "completed").length,
    nodesTotal: SUB_NODE_TOTAL,
    casesComplete: caseRows.filter((c) => c.status.startsWith("complete")).length,
    casesTotal: CASE_TOTAL,
    recentSubmissions: caseRows.map((c) => ({
      caseId: c.case_id,
      title: c.case_id,
      status: c.status,
      body: c.body,
      submittedAt: c.submitted_at,
      lastReview: parseReview(c.pm_ai_response),
    })),
    declineCount: (declines.data ?? []).length,
    declines: (declines.data ?? []).map((d) => ({
      kind: d.kind,
      summary: d.prompt_summary,
      at: d.created_at,
    })),
    memoryDoc: "",
  };
}
