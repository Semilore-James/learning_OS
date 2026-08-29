"use client";

/* ============================================================================
   Case Files window (build step 16 / PRD 8 / Userflow 7). Card list with
   difficulty + status filters, a detail panel with the markdown brief, and the
   submission state machine: open -> in progress -> submitted -> complete, with
   an accept / revise / override branch after PM-AI review.
   ========================================================================== */
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Download, FileSpreadsheet, X } from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { CASES, CASES_BY_ID, DIFFICULTY_ACCENT, type Difficulty } from "@/content/cases/registry";
import { digestCsvFile } from "@/lib/casefiles/csvDigest";
import { pmClientKey } from "@/lib/pmai/clientKey";
import type { CsvDigest } from "@/lib/ai/types";
import { useStore, select } from "@/lib/store";
import { useWindowActions } from "@/lib/windowContext";
import { TOPICS } from "@/content/curriculum";
import { subNodesFor } from "@/lib/curriculumLayout";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ParticleButton } from "@/components/motion";

type ReviewState =
  | { phase: "idle" }
  | { phase: "loading" }
  | { phase: "error"; message: string }
  | { phase: "done"; verdict: "accept" | "revise"; strength: string; gap: string; question: string };

function useLearnerContext() {
  const { state } = useStore();
  return useMemo(() => {
    const active = select.activeNodeId(state);
    let activeNode: { id: string; label: string; topic: string } | null = null;
    for (const t of TOPICS) {
      const s = subNodesFor(t).find((n) => n.id === active);
      if (s) activeNode = { id: s.id, label: s.label, topic: t.label };
    }
    const done = Object.values(state.cases).filter((c) => c.status.startsWith("complete")).length;
    return {
      xpTotal: state.xpTotal,
      streakDays: select.streak(state).current,
      nodesCompleted: select.completedNodeIds(state).size,
      casesComplete: done,
      casesTotal: CASES.length,
      declineCount: state.declineCount,
      activeNode,
    };
  }, [state]);
}

export function CaseFilesWindow() {
  const { state, dispatch } = useStore();
  const win = useWindowActions();
  const ctx = useLearnerContext();
  const [selectedId, setSelectedId] = useState(CASES[0].id);
  const [view, setView] = useState<"board" | "table">("table");
  const [diff, setDiff] = useState<Difficulty | "ALL">("ALL");
  const [brief, setBrief] = useState<{ id: string; md: string } | null>(null);
  const [draft, setDraft] = useState("");
  const [review, setReview] = useState<ReviewState>({ phase: "idle" });
  const [confirmOverride, setConfirmOverride] = useState(false);
  const [digest, setDigest] = useState<CsvDigest | null>(null);
  const [digestNote, setDigestNote] = useState<string | null>(null);
  const [digesting, setDigesting] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const clearDigest = () => {
    setDigest(null);
    setDigestNote(null);
    if (fileRef.current) fileRef.current.value = "";
  };

  const attachCsv = async (file: File | undefined) => {
    if (!file) return;
    setDigesting(true);
    setDigestNote(null);
    const { digest: d, summary } = await digestCsvFile(file);
    setDigest(d);
    setDigestNote(summary);
    setDigesting(false);
  };

  const def = CASES_BY_ID[selectedId];
  const sub = state.cases[selectedId];
  const status: string = sub?.status ?? "open";

  const list = CASES.filter((c) => diff === "ALL" || c.difficulty === diff);

  useEffect(() => {
    if (!def.written) return;
    let cancelled = false;
    fetch(`/cases/${selectedId}.md`)
      .then((r) => (r.ok ? r.text() : Promise.reject(new Error())))
      .then((md) => !cancelled && setBrief({ id: selectedId, md }))
      .catch(() => !cancelled && setBrief({ id: selectedId, md: "" }));
    return () => {
      cancelled = true;
    };
  }, [selectedId, def.written]);

  const start = () => {
    dispatch({ type: "startCase", caseId: selectedId });
    setDraft("");
    setReview({ phase: "idle" });
    clearDigest();
  };

  const submit = async () => {
    if (draft.trim().length < 20) return;
    dispatch({ type: "submitCase", caseId: selectedId, body: draft, pmAiResponse: null });
    setReview({ phase: "loading" });
    try {
      const res = await fetch("/api/pm-ai/review", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          caseId: selectedId,
          caseTitle: def.title,
          caseBrief: brief?.md?.slice(0, 2500) ?? "",
          submission: draft,
          digest,
          context: ctx,
          clientKey: pmClientKey(),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setReview({ phase: "error", message: data.error ?? "review failed" });
      } else {
        setReview({
          phase: "done",
          verdict: data.verdict === "accept" ? "accept" : "revise",
          strength: data.strength ?? "",
          gap: data.gap ?? "",
          question: data.question ?? "",
        });
        dispatch({ type: "submitCase", caseId: selectedId, body: draft, pmAiResponse: data });
      }
    } catch {
      setReview({ phase: "error", message: "Couldn't reach your PM. Your submission is saved." });
    }
  };

  const complete = (override: boolean) => {
    dispatch({
      type: "completeCase",
      caseId: selectedId,
      override,
      reviewAccepted: review.phase === "done" && review.verdict === "accept" && !override,
    });
  };

  const statusChip = (s: string) => {
    const map: Record<string, [string, string]> = {
      open: ["OPEN", "var(--muted-foreground)"],
      in_progress: ["IN PROGRESS", "var(--accent-1)"],
      submitted: ["SUBMITTED", "var(--primary)"],
      complete: ["COMPLETE", "var(--accent-2)"],
      complete_override: ["COMPLETE (OVERRIDE)", "var(--accent-1)"],
    };
    const [label, color] = map[s] ?? ["OPEN", "var(--muted-foreground)"];
    return (
      <span className="font-mono text-[9px]" style={{ color, border: `1px solid ${color}`, padding: "1px 6px" }}>
        {label}
      </span>
    );
  };

  const touched = Object.keys(state.cases).length;

  const openCase = (id: string) => {
    setSelectedId(id);
    setDraft(state.cases[id]?.body ?? "");
    setReview({ phase: "idle" });
    clearDigest();
    setView("board");
  };

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b border-border px-2 py-1.5">
        <div className="flex gap-1">
          {(["table", "board"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setView(v)}
              className={cn(
                "chrome-flat px-2.5 py-1 font-mono text-[9px] uppercase tracking-wide",
                view === v ? "bg-primary text-primary-foreground" : "bg-surface-raised text-muted-foreground",
              )}
            >
              {v === "table" ? "All cases" : "Case board"}
            </button>
          ))}
        </div>
        <span className="font-mono text-[9px] text-brand-green">{touched} of {CASES.length} touched</span>
      </div>

      {view === "table" ? (
        <AllCasesTable
          cases={CASES}
          statusOf={(id) => state.cases[id]?.status ?? "open"}
          chip={statusChip}
          onOpen={openCase}
        />
      ) : (
    <div className="flex min-h-0 flex-1">
      {/* list */}
      <div className="flex w-64 min-w-64 flex-col border-r border-border bg-surface">
        <div className="flex gap-1 border-b border-border p-2">
          {(["ALL", "ROOKIE", "ANALYST", "SENIOR"] as const).map((d) => (
            <button
              key={d}
              type="button"
              onClick={() => setDiff(d)}
              className={cn(
                "chrome-flat flex-1 py-1 font-mono text-[9px]",
                diff === d ? "bg-primary text-primary-foreground" : "bg-surface-raised text-muted-foreground",
              )}
            >
              {d}
            </button>
          ))}
        </div>
        <div className="flex flex-1 flex-col gap-2 overflow-auto p-2.5">
          {list.map((c) => {
            const st = state.cases[c.id]?.status ?? "open";
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => openCase(c.id)}
                className={cn(
                  "chrome-flat flex flex-col gap-1 bg-surface-raised p-2.5 text-left",
                  c.id === selectedId && "outline outline-1 outline-primary",
                )}
                style={{ borderLeft: `3px solid ${DIFFICULTY_ACCENT[c.difficulty]}` }}
              >
                <div className="flex items-center justify-between">
                  <span className="font-mono text-[9px] text-muted-foreground">{c.num}</span>
                  {statusChip(st)}
                </div>
                <span className="text-xs font-semibold text-foreground">{c.title}</span>
                <span className="font-mono text-[9px]" style={{ color: DIFFICULTY_ACCENT[c.difficulty] }}>
                  {c.difficulty} · {c.industry}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-2 border-t border-border px-3 py-2">
          <div className="h-1 flex-1 bg-surface-raised">
            <div className="h-full bg-brand-green" style={{ width: `${(touched / CASES.length) * 100}%` }} />
          </div>
          <span className="font-mono text-[9px] text-brand-green">{touched} of {CASES.length} touched</span>
        </div>
      </div>

      {/* detail */}
      <div className="flex min-h-0 flex-1 flex-col">
        <div className="flex items-center justify-between gap-3 border-b border-border p-3">
          <div>
            <h2 className="font-display text-base font-semibold text-foreground">
              Case {def.num} — {def.title}
            </h2>
            <span className="font-mono text-[10px]" style={{ color: DIFFICULTY_ACCENT[def.difficulty] }}>
              {def.difficulty} · {def.industry}
            </span>
          </div>
          {status === "open" && <Button size="sm" onClick={start}>Start this case (+10 XP)</Button>}
        </div>

        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-b border-border px-3 py-1.5 text-[11px]">
          <span className="text-muted-foreground">
            Recommended tool: <span className="font-semibold text-foreground">{def.tool}</span>
          </span>
          <button
            type="button"
            onClick={() => win.open("pmai")}
            className="text-primary hover:underline"
          >
            Stuck? Ask your PM in L_OS COMMS →
          </button>
        </div>

        {def.datasets && def.datasets.length > 0 && (
          <div className="flex flex-col gap-1.5 border-b border-border bg-surface-raised px-3 py-2.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
              Dataset{def.datasets.length > 1 ? "s" : ""} — download and work in your own tool
            </span>
            <div className="flex flex-wrap gap-1.5">
              {def.datasets.map((d) => (
                <a
                  key={d.file}
                  href={`/cases/data/${def.id}/${d.file}`}
                  download
                  className="chrome-flat flex items-center gap-1.5 bg-surface px-2 py-1 text-[11px] text-foreground hover:text-primary"
                  title={`${d.rows.toLocaleString()} rows · ${d.quality}`}
                >
                  <Download className="size-3" /> {d.file}
                  <span className="font-mono text-[9px] text-muted-foreground">{d.rows.toLocaleString()} rows</span>
                </a>
              ))}
            </div>
            <ul className="flex flex-col gap-0.5 pt-0.5">
              {def.datasets.map((d) => (
                <li key={d.file} className="font-mono text-[9px] text-muted-foreground">
                  {d.file}: {d.quality}
                </li>
              ))}
            </ul>
          </div>
        )}

        <div className="min-h-0 flex-1 overflow-auto p-5">
          {!def.written ? (
            <p className="text-sm text-muted-foreground">
              The full brief for this case is being written (Phase 2 content pass). It exercises:{" "}
              {def.skills.map((s) => (
                <code key={s} className="font-mono text-[11px] text-brand-green">{s} </code>
              ))}
            </p>
          ) : (
            <div className="prose-da">
              {brief?.md ? (
                <ReactMarkdown remarkPlugins={[remarkGfm]}>{brief.md}</ReactMarkdown>
              ) : (
                <p className="text-muted-foreground">Loading brief…</p>
              )}
            </div>
          )}

          {(status === "in_progress" || status === "submitted") && (
            <div className="mt-6 flex flex-col gap-2">
              <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                Your findings
              </span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder="Your queries, findings, and what you would tell the stakeholder…"
                className="min-h-40 w-full resize-y border border-border bg-background p-3 font-body text-sm leading-relaxed"
                style={{ borderRadius: "var(--radius-control)" }}
              />

              <input
                ref={fileRef}
                type="file"
                accept=".csv,text/csv,text/plain"
                className="hidden"
                onChange={(e) => attachCsv(e.target.files?.[0])}
              />
              {digestNote ? (
                <div className="chrome-flat flex items-center gap-2 bg-surface-raised px-3 py-2 text-[11px]">
                  <FileSpreadsheet className="size-3.5 shrink-0 text-brand-green" />
                  <span className="flex-1 text-muted-foreground">{digestNote}</span>
                  <button type="button" onClick={clearDigest} className="text-muted-foreground hover:text-foreground">
                    <X className="size-3.5" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  disabled={digesting}
                  className="chrome-flat flex w-fit items-center gap-1.5 bg-surface-raised px-3 py-1.5 text-[11px] text-muted-foreground hover:text-foreground disabled:opacity-60"
                >
                  <FileSpreadsheet className="size-3.5" />
                  {digesting ? "Reading your file…" : "Attach your cleaned CSV (read in your browser, not uploaded)"}
                </button>
              )}

              <div className="flex items-center gap-2">
                <ParticleButton
                  onClick={submit}
                  disabled={review.phase === "loading" || draft.trim().length < 20}
                >
                  {review.phase === "loading" ? "Your PM is reading it…" : "Send to your PM for review"}
                </ParticleButton>
                {sub?.startedAt && (
                  <span className="font-mono text-[10px] text-muted-foreground">
                    started {sub.startedAt.slice(0, 10)}
                  </span>
                )}
              </div>
            </div>
          )}

          {review.phase === "loading" && (
            <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground">
              <span className="size-3 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
              Your PM is reading your submission…
            </p>
          )}
          {review.phase === "error" && (
            <div className="chrome-flat mt-4 bg-surface-raised p-3 text-sm text-brand-amber">{review.message}</div>
          )}
          {review.phase === "done" && (
            <div className="chrome-flat mt-4 flex flex-col gap-2 bg-surface-raised p-3.5 text-sm">
              <span
                className={cn(
                  "w-fit font-mono text-[10px] uppercase tracking-widest",
                  review.verdict === "accept" ? "text-brand-green" : "text-brand-amber",
                )}
              >
                {review.verdict === "accept" ? "PM: accepted" : "PM: needs revision"}
              </span>
              <p><span className="font-semibold text-brand-green">Strength.</span> {review.strength}</p>
              <p><span className="font-semibold text-brand-amber">Gap.</span> {review.gap}</p>
              <p><span className="font-semibold text-primary">Question.</span> {review.question}</p>
            </div>
          )}

          {status === "submitted" && (
            <div className="mt-4 flex flex-col gap-2">
              {review.phase === "loading" ? null : (
                <div className="flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant={review.phase === "done" && review.verdict === "accept" ? "secondary" : "default"}
                    onClick={() => dispatch({ type: "startCase", caseId: selectedId })}
                  >
                    Revise &amp; resubmit
                  </Button>

                  {review.phase === "done" && review.verdict === "accept" && (
                    <ParticleButton onClick={() => complete(false)}>
                      Accept &amp; mark complete (+130 XP)
                    </ParticleButton>
                  )}

                  <Button size="sm" variant="outline" onClick={() => setConfirmOverride((v) => !v)}>
                    {review.phase === "done" && review.verdict === "revise"
                      ? "Mark complete anyway"
                      : "Override and mark complete"}
                  </Button>
                </div>
              )}

              {review.phase === "done" && review.verdict === "revise" && !confirmOverride && (
                <p className="text-[11px] text-muted-foreground">
                  Your PM hasn&apos;t signed this off. Address the gap and send it back, or mark it
                  complete anyway (logged as a disagreement, +80 XP).
                </p>
              )}

              {confirmOverride && (
                <div className="chrome-flat flex items-center gap-2 bg-surface-raised p-2.5 text-[12px]">
                  <span className="text-muted-foreground">
                    Marking this complete against your PM logs a disagreement in the decline log.
                  </span>
                  <Button size="xs" onClick={() => { setConfirmOverride(false); complete(true); }}>
                    Confirm
                  </Button>
                  <Button size="xs" variant="outline" onClick={() => setConfirmOverride(false)}>
                    Cancel
                  </Button>
                </div>
              )}
            </div>
          )}

          {(status === "complete" || status === "complete_override") && (
            <p className="mt-6 font-mono text-xs text-brand-green">
              ✓ Case complete{status === "complete_override" && " — override logged"}.
            </p>
          )}
        </div>
      </div>
    </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------- all cases --- */
function AllCasesTable({
  cases,
  statusOf,
  chip,
  onOpen,
}: {
  cases: typeof CASES;
  statusOf: (id: string) => string;
  chip: (s: string) => ReactNode;
  onOpen: (id: string) => void;
}) {
  return (
    <div className="min-h-0 flex-1 overflow-auto">
      <table className="w-full border-collapse text-[12px]">
        <thead className="sticky top-0 bg-surface">
          <tr className="border-b border-border text-left font-mono text-[9px] uppercase tracking-wide text-muted-foreground">
            <th className="p-2 font-normal">#</th>
            <th className="p-2 font-normal">Case</th>
            <th className="p-2 font-normal">Level</th>
            <th className="p-2 font-normal">Industry</th>
            <th className="p-2 font-normal">Recommended tool</th>
            <th className="p-2 font-normal">Data</th>
            <th className="p-2 font-normal">Status</th>
          </tr>
        </thead>
        <tbody>
          {cases.map((c) => {
            const rows = (c.datasets ?? []).reduce((n, d) => n + d.rows, 0);
            return (
              <tr
                key={c.id}
                onClick={() => onOpen(c.id)}
                className="cursor-pointer border-b border-border hover:bg-surface-raised"
              >
                <td className="p-2 font-mono text-[10px] text-muted-foreground">{c.num}</td>
                <td className="p-2">
                  <span className="font-semibold text-foreground">{c.title}</span>
                  {!c.written && <span className="ml-2 font-mono text-[9px] text-brand-amber">brief pending</span>}
                  <span className="block font-mono text-[9px] text-muted-foreground">
                    {c.skills.join(" · ")}
                  </span>
                </td>
                <td className="p-2">
                  <span className="font-mono text-[10px]" style={{ color: DIFFICULTY_ACCENT[c.difficulty] }}>
                    {c.difficulty}
                  </span>
                </td>
                <td className="p-2 text-muted-foreground">{c.industry}</td>
                <td className="p-2 text-muted-foreground">{c.tool}</td>
                <td className="p-2 font-mono text-[10px] text-muted-foreground">
                  {c.datasets?.length ? `${c.datasets.length} file${c.datasets.length > 1 ? "s" : ""} · ${rows.toLocaleString()} rows` : "—"}
                </td>
                <td className="p-2">{chip(statusOf(c.id))}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
